import { createFetchRssHandler } from '@/features/rss-crawler/api/create-fetch-rss-handler';
import { crawlBlogRss } from '@/features/rss-crawler/lib/rss-crawler';
import {
  BLOG_POSTS_PATH,
  saveBlogPosts,
  saveBlogSamples,
} from '@/shared/api/data-files';

export const POST = createFetchRssHandler({
  crawlBlogRss,
  saveBlogPosts,
  saveBlogSamples,
  blogPostsPath: BLOG_POSTS_PATH,
});
