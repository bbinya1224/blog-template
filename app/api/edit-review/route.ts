import { createEditReviewHandler } from '@/features/review/api/create-edit-review-handler';
import { editReviewWithClaudeAPI } from '@/features/review/lib/review-generator';
import { readStyleProfile } from '@/shared/api/data-files';
import { isValidEditRequest } from '@/shared/lib/validators';

export const POST = createEditReviewHandler({
  validateEditRequest: isValidEditRequest,
  readStyleProfile,
  editReview: editReviewWithClaudeAPI,
});
