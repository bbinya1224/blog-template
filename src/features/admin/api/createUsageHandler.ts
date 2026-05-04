import { ApiResponse } from '@/shared/api/response';
import { withAdmin } from '@/shared/api/middleware';
import { calculateTotalCostWithWarnings, computeSummary } from '../lib/tokenPricing';
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

const isValidISODate = (value: string): boolean =>
  !Number.isNaN(Date.parse(value));

export const createUsageGetHandler = (deps: UsageDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const url = new URL(request.url);
      const rawStart = url.searchParams.get('startDate');
      const rawEnd = url.searchParams.get('endDate');

      if (rawStart && !isValidISODate(rawStart)) {
        return ApiResponse.validationError('startDate 형식이 올바르지 않습니다.');
      }
      if (rawEnd && !isValidISODate(rawEnd)) {
        return ApiResponse.validationError('endDate 형식이 올바르지 않습니다.');
      }

      const startDate = rawStart ?? undefined;
      const endDate = rawEnd ?? undefined;

      const [logs, users, endpoints, recent] = await Promise.all([
        deps.getUsageLogs(startDate, endDate),
        deps.getUserUsageSummaries(startDate, endDate),
        deps.getEndpointBreakdown(startDate, endDate),
        deps.getRecentActivity(20),
      ]);

      const summary = computeSummary(logs);
      const { cost: estimatedCost, unknownModels } = calculateTotalCostWithWarnings(logs);

      return ApiResponse.success({
        summary,
        users,
        endpoints,
        recent,
        estimatedCost,
        ...(unknownModels.length > 0 && { unknownModels }),
      });
    } catch (error) {
      console.error('사용량 조회 오류:', error);
      return ApiResponse.serverError('사용량 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};
