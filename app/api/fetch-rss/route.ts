import { createFetchRssHandler } from '@/features/rss-crawler/api/createFetchRssHandler';
import { crawlBlogRss } from '@/features/rss-crawler';
import { saveBlogPosts, saveBlogSamples } from '@/shared/api/dataFiles';

export const POST = createFetchRssHandler({
  crawlBlogRss,
  saveBlogPosts,
  saveBlogSamples,
});
