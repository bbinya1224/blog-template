import { createUpdateReviewHandler } from '@/features/review/api/create-update-review-handler';
import { updateReview } from '@/entities/review';
import { incrementUsageCount } from '@/shared/api/data-files';

export const PUT = createUpdateReviewHandler({
  updateReview,
  incrementUsageCount,
});
