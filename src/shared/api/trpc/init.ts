import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
import { getUserStatus } from '@/shared/api/data-files';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

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

// TODO: Phase 3 - migrate to whitelist-based admin check
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];

  if (!adminEmails.includes(ctx.user.email)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '관리자 권한이 필요합니다.',
    });
  }

  return next();
});
