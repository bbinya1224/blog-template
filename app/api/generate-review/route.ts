import { createGenerateReviewHandler } from '@/features/review/api/create-generate-review-handler';
import { generateReviewWithClaudeAPI } from '@/features/review/lib/review-generator';
import { readStyleProfile, saveReviewToFile } from '@/shared/api/data-files';
import { isValidReviewPayload } from '@/shared/lib/validators';

export const POST = createGenerateReviewHandler({
  validateReviewPayload: isValidReviewPayload,
  readStyleProfile,
  generateReview: generateReviewWithClaudeAPI,
  saveReviewToFile,
});
