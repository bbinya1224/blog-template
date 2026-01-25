import { router } from './init';
import { reviewRouter } from '@/features/review/api/router';
import { styleRouter } from '@/features/analyze-style/api/router';
import { adminRouter } from '@/features/admin/api/router';
import { rssRouter } from '@/features/rss-crawler/api/router';

export const appRouter = router({
  review: reviewRouter,
  style: styleRouter,
  admin: adminRouter,
  rss: rssRouter,
});

export type AppRouter = typeof appRouter;
