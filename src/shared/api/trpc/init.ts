/**
 * tRPC 초기화 및 미들웨어 정의
 * - 기존 withAuth, withQuota, withAdmin 패턴을 tRPC procedure로 변환
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
import { getUserStatus } from '@/shared/api/data-files';

/**
 * tRPC 인스턴스 생성
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * 인증 미들웨어 (기존 withAuth)
 * - 세션 확인
 * - ctx에 user 정보 주입
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: {
        email: ctx.session.user.email,
        name: ctx.session.user.name,
      },
    },
  });
});

/**
 * 쿼터 체크 미들웨어 (기존 withQuota)
 * - protectedProcedure 이후 실행
 * - 무료 체험 횟수 확인
 */
export const quotaProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const status = await getUserStatus(ctx.user.email);

    if (status?.is_preview && (status.usage_count || 0) >= 2) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '무료 체험 횟수가 만료되었습니다. 후원 후 계속 이용해주세요!',
      });
    }

    return next();
  }
);

/**
 * 어드민 미들웨어 (기존 withAdmin)
 * - protectedProcedure 이후 실행
 * - 어드민 권한 확인
 * TODO: Phase 3에서 화이트리스트 기반으로 변경 예정
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // 임시: 환경변수로 어드민 이메일 체크
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];

  if (!adminEmails.includes(ctx.user.email)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '관리자 권한이 필요합니다.',
    });
  }

  return next();
});
