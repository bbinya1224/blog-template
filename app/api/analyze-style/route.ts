import { createAnalyzeStyleHandler } from '@/features/analyze-style/api/createAnalyzeStyleHandler';
import { generateStyleProfileWithClaude } from '@/features/analyze-style/lib/styleAnalysis';
import {
  readBlogPosts,
  saveStyleProfile,
} from '@/shared/api/dataFiles';

export const POST = createAnalyzeStyleHandler({
  readBlogPosts,
  generateStyleProfile: generateStyleProfileWithClaude,
  saveStyleProfile,
});
