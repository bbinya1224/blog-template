import {
  router,
  protectedProcedure,
  quotaProtectedProcedure,
} from '@/shared/api/trpc/init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import {
  generateReviewWithClaudeAPI,
  editReviewWithClaudeAPI,
} from '../lib/review-generator';
import {
  readStyleProfile,
  saveReviewToDB,
  incrementUsageCount,
} from '@/shared/api/data-files';
import { updateReview } from '@/entities/review';

const reviewPayloadSchema = z.object({
  name: z.string().min(1, '가게 이름을 입력해주세요'),
  location: z.string().min(1, '위치를 입력해주세요'),
  date: z.string(),
  menu: z.string(),
  companion: z.string(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  extra: z.string().optional(),
  user_draft: z.string().optional(),
});

const editReviewSchema = z.object({
  review: z.string().min(1, '리뷰 내용이 필요합니다'),
  request: z.string().min(1, '수정 요청을 입력해주세요'),
});

const updateReviewSchema = z.object({
  id: z.string(),
  content: z.string(),
});

export const reviewRouter = router({
  generate: quotaProtectedProcedure
    .input(reviewPayloadSchema)
    .mutation(async ({ input, ctx }) => {
      const email = ctx.user.email;

      const styleProfile = await readStyleProfile(email);
      if (!styleProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '스타일 프로필이 없습니다. 먼저 스타일 분석을 완료해주세요.',
        });
      }

      const review = await generateReviewWithClaudeAPI(
        input,
        styleProfile,
        email,
      );

      const savedId = await saveReviewToDB(email, review, input);

      await incrementUsageCount(email);

      return {
        review,
        message: `리뷰 생성 및 저장 완료 (ID: ${savedId})`,
      };
    }),

  edit: quotaProtectedProcedure
    .input(editReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const styleProfile = await readStyleProfile(ctx.user.email);
      if (!styleProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '스타일 프로필이 없습니다.',
        });
      }

      const review = await editReviewWithClaudeAPI(
        input.review,
        input.request,
        styleProfile,
      );

      await incrementUsageCount(ctx.user.email);

      return { review };
    }),

  update: protectedProcedure
    .input(updateReviewSchema)
    .mutation(async ({ input, ctx }) => {
      await updateReview(input.id, input.content);
      await incrementUsageCount(ctx.user.email);

      return { success: true };
    }),
});
