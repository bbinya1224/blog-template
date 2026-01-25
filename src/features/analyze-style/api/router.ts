import {
  router,
  protectedProcedure,
  quotaProtectedProcedure,
} from '@/shared/api/trpc/init';
import { TRPCError } from '@trpc/server';

import { generateStyleProfileWithClaude } from '../lib/style-analysis';
import {
  readBlogPosts,
  saveStyleProfile,
  readStyleProfile,
} from '@/shared/api/data-files';
import { StyleAnalysisError } from '@/shared/lib/errors';

export const styleRouter = router({
  analyze: quotaProtectedProcedure.mutation(async ({ ctx }) => {
    const email = ctx.user.email;

    const blogText = await readBlogPosts(email);

    if (!blogText || blogText.trim().length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '분석할 블로그 글이 없습니다. 먼저 RSS를 불러와주세요.',
      });
    }

    try {
      const styleProfile = await generateStyleProfileWithClaude(blogText);

      await saveStyleProfile(email, styleProfile);

      return {
        styleProfile,
        message: 'Claude API를 통한 스타일 분석이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof StyleAnalysisError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error
            ? error.message
            : '스타일 분석 중 알 수 없는 오류가 발생했습니다.',
      });
    }
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const styleProfile = await readStyleProfile(ctx.user.email);

    if (!styleProfile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '스타일 프로필이 없습니다.',
      });
    }

    return { styleProfile };
  }),
});
