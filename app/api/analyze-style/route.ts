import { createAnalyzeStyleHandler } from '@/features/analyze-style/api/create-analyze-style-handler';
import { generateStyleProfileWithClaude } from '@/features/analyze-style/lib/style-analysis';
import { readBlogPosts, saveStyleProfile } from '@/shared/api/data-files';

export const POST = createAnalyzeStyleHandler({
  readBlogPosts,
  generateStyleProfile: generateStyleProfileWithClaude,
  saveStyleProfile,
});
