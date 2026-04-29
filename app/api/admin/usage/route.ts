import { createUsageGetHandler } from '@/features/admin/api/createUsageHandler';
import {
  getUsageSummary,
  getUserUsageSummaries,
  getEndpointBreakdown,
  getRecentActivity,
} from '@/features/admin/api/usageRepository';

const deps = {
  getUsageSummary,
  getUserUsageSummaries,
  getEndpointBreakdown,
  getRecentActivity,
};

export const GET = createUsageGetHandler(deps);
