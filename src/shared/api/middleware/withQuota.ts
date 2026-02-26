import { getUserStatus } from '@/shared/api/dataFiles';
import { ApiResponse } from '../response';
import type { AuthenticatedRequest } from './withAuth';

type QuotaHandler<TContext = unknown> = (
  request: AuthenticatedRequest,
  context?: TContext
) => Promise<Response>;

// Must be used after withAuth middleware
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
