import { createEditReviewHandler } from '@/features/review/api/createEditReviewHandler';
import { editReviewWithClaudeAPI } from '@/features/review/lib/reviewGenerator';
import { readStyleProfile, incrementUsageCount } from '@/shared/api/dataFiles';
import { isValidEditRequest } from '@/shared/lib/validators';

export const POST = createEditReviewHandler({
  validateEditRequest: isValidEditRequest,
  readStyleProfile,
  editReview: editReviewWithClaudeAPI,
  incrementUsageCount,
});
