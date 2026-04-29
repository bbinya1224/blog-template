import { ApiResponse } from '@/shared/api/response';
import { withAdmin } from '@/shared/api/middleware';
import type {
  UsageSummary,
  UserUsageSummary,
  EndpointSummary,
  RecentActivity,
} from './usageRepository';

type UsageDeps = {
  getUsageSummary: (
    startDate?: string,
    endDate?: string,
  ) => Promise<UsageSummary>;
  getUserUsageSummaries: (
    startDate?: string,
    endDate?: string,
  ) => Promise<UserUsageSummary[]>;
  getEndpointBreakdown: (
    startDate?: string,
    endDate?: string,
  ) => Promise<EndpointSummary[]>;
  getRecentActivity: (limit?: number) => Promise<RecentActivity[]>;
};

export const createUsageGetHandler = (deps: UsageDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const url = new URL(request.url);
      const startDate = url.searchParams.get('startDate') ?? undefined;
      const endDate = url.searchParams.get('endDate') ?? undefined;

      const [summary, users, endpoints, recent] = await Promise.all([
        deps.getUsageSummary(startDate, endDate),
        deps.getUserUsageSummaries(startDate, endDate),
        deps.getEndpointBreakdown(startDate, endDate),
        deps.getRecentActivity(20),
      ]);

      return ApiResponse.success({ summary, users, endpoints, recent });
    } catch (error) {
      console.error('사용량 조회 오류:', error);
      return ApiResponse.serverError('사용량 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};
