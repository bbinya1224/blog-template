import { createFetchRssHandler } from '@/features/rss-crawler/api/create-fetch-rss-handler';
import { crawlBlogRss } from '@/features/rss-crawler';
import { saveBlogPosts, saveBlogSamples } from '@/shared/api/data-files';

export const POST = createFetchRssHandler({
  crawlBlogRss,
  saveBlogPosts,
  saveBlogSamples,
});
