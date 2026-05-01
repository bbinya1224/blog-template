import { ApiResponse } from '@/shared/api/response';
import { withAdmin } from '@/shared/api/middleware';
import { calculateTotalCost, computeSummary } from '../lib/tokenPricing';
import type { UsageLogRow } from '../lib/tokenPricing';
import type {
  UserUsageSummary,
  EndpointSummary,
  RecentActivity,
} from './usageRepository';

type UsageDeps = {
  getUsageLogs: (
    startDate?: string,
    endDate?: string,
  ) => Promise<UsageLogRow[]>;
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

      const [logs, users, endpoints, recent] = await Promise.all([
        deps.getUsageLogs(startDate, endDate),
        deps.getUserUsageSummaries(startDate, endDate),
        deps.getEndpointBreakdown(startDate, endDate),
        deps.getRecentActivity(20),
      ]);

      const summary = computeSummary(logs);
      const estimatedCost = calculateTotalCost(logs);

      return ApiResponse.success({ summary, users, endpoints, recent, estimatedCost });
    } catch (error) {
      console.error('사용량 조회 오류:', error);
      return ApiResponse.serverError('사용량 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};
