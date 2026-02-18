import { createEditReviewHandler } from '@/features/review/api/create-edit-review-handler';
import { editReviewWithClaudeAPI } from '@/features/review/lib/review-generator';
import { readStyleProfile } from '@/shared/api/data-files';
import { ValidationError } from '@/shared/lib/errors';
import type { ReviewEditPayload } from '@/shared/types/review';

function validateEditRequest(payload: unknown): payload is ReviewEditPayload {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('review' in payload) ||
    !('request' in payload)
  ) {
    throw new ValidationError('review와 request가 필요합니다.');
  }

  const { review, request } = payload as Record<string, unknown>;
  if (typeof review !== 'string' || !review.trim()) {
    throw new ValidationError('리뷰 내용이 필요합니다.');
  }
  if (typeof request !== 'string' || !request.trim()) {
    throw new ValidationError('수정 요청을 입력해주세요.');
  }

  return true;
}

export const POST = createEditReviewHandler({
  validateEditRequest,
  readStyleProfile,
  editReview: editReviewWithClaudeAPI,
});
