import { router, protectedProcedure } from '@/shared/api/trpc/init';
import { z } from 'zod';

import { crawlBlogRss } from '../lib/rss-crawler';
import { saveBlogPosts, saveBlogSamples } from '@/shared/api/data-files';

const fetchRssSchema = z.object({
  rssUrl: z.string().url('유효한 RSS URL을 입력해주세요.'),
  maxPosts: z.number().int().positive().optional().default(20),
  debug: z.boolean().optional().default(false),
});

export const rssRouter = router({
  fetch: protectedProcedure
    .input(fetchRssSchema)
    .mutation(async ({ input, ctx }) => {
      const { rssUrl, maxPosts, debug } = input;
      const email = ctx.user.email;

      const { mergedText, samples } = await crawlBlogRss(rssUrl, maxPosts, {
        debug,
      });

      await Promise.all([
        saveBlogPosts(email, mergedText),
        saveBlogSamples(email, samples),
      ]);

      return {
        success: true,
        message: 'RSS 크롤링, 스타일 분석 데이터 및 샘플 저장 완료 (DB)',
        sampleCount: samples.length,
        length: mergedText.length,
      };
    }),
});
