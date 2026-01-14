/**
 * 쿼터 체크 미들웨어
 * 무료 체험 횟수 확인
 */

import { getUserStatus } from '@/shared/api/data-files';
import { ApiResponse } from '../response';
import type { AuthenticatedRequest } from './with-auth';

type QuotaHandler<TContext = unknown> = (
  request: AuthenticatedRequest,
  context?: TContext
) => Promise<Response>;

/**
 * 쿼터 체크가 필요한 핸들러를 감싸는 미들웨어
 * 반드시 withAuth 이후에 사용해야 함
 *
 * @example
 * const handler = withAuth(withQuota(async (request) => {
 *   // 인증 + 쿼터 체크 완료된 상태
 * }));
 */
export const withQuota = <TContext = unknown>(
  handler: QuotaHandler<TContext>
) => {
  return async (
    request: AuthenticatedRequest,
    context?: TContext
  ): Promise<Response> => {
    try {
      const status = await getUserStatus(request.user.email);

      if (status?.is_preview && (status.usage_count || 0) >= 2) {
        return ApiResponse.quotaExceeded();
      }

      return handler(request, context);
    } catch (error) {
      console.error('쿼터 체크 미들웨어 오류:', error);
      return ApiResponse.serverError();
    }
  };
};
