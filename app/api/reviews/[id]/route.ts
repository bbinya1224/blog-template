import { createUpdateReviewHandler } from '@/features/review/api/createUpdateReviewHandler';
import { updateReview } from '@/entities/review';
import { incrementUsageCount } from '@/shared/api/dataFiles';

export const PUT = createUpdateReviewHandler({
  updateReview,
  incrementUsageCount,
});
