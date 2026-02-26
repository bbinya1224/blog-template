import { createUpdateReviewHandler } from '@/features/review/api/createUpdateReviewHandler';
import { createDeleteReviewHandler } from '@/features/review/api/createDeleteReviewHandler';
import { updateReview, deleteReview } from '@/entities/review/api';
import { incrementUsageCount } from '@/shared/api/dataFiles';

export const PUT = createUpdateReviewHandler({
  updateReview,
  incrementUsageCount,
});

export const DELETE = createDeleteReviewHandler({
  deleteReview,
});
