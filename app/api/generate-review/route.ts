import { createGenerateReviewHandler } from '@/features/review/api/createGenerateReviewHandler';
import { generateReviewWithClaudeAPI } from '@/features/review/lib/reviewGenerator';
import {
  readStyleProfile,
  saveReviewToDB,
  getUserStatus,
  incrementUsageCount,
} from '@/shared/api/dataFiles';
import { reviewPayloadSchema } from '@/shared/types/review';
import type { ReviewPayload } from '@/shared/types/review';
import { ValidationError } from '@/shared/lib/errors';

function validateReviewPayload(payload: unknown): payload is ReviewPayload {
  const result = reviewPayloadSchema.safeParse(payload);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message || '잘못된 요청 형식입니다.');
  }
  return true;
}

export const POST = createGenerateReviewHandler({
  validateReviewPayload,
  readStyleProfile,
  generateReview: generateReviewWithClaudeAPI,
  saveReviewToDB,
  getUserStatus,
  incrementUsageCount,
});
