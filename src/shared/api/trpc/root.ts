/**
 * tRPC 루트 라우터
 * - 모든 feature 라우터를 여기에 통합
 */

import { router } from './init';
import { reviewRouter } from '@/features/review/api/router';

/**
 * App Router
 * Phase 2: reviewRouter 추가 완료 ✅
 * Phase 3에서 styleRouter, adminRouter, rssRouter 추가 예정
 */
export const appRouter = router({
  review: reviewRouter,

  // Phase 3에서 추가:
  // style: styleRouter,
  // admin: adminRouter,
  // rss: rssRouter,
});

/**
 * Export type definition of API
 * 클라이언트에서 타입 안전하게 사용
 */
export type AppRouter = typeof appRouter;
