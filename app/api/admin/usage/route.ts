import { createUsageGetHandler } from '@/features/admin/api/createUsageHandler';
import {
  getUsageLogs,
  getUserUsageSummaries,
  getEndpointBreakdown,
  getRecentActivity,
} from '@/features/admin/api/usageRepository';

const deps = {
  getUsageLogs,
  getUserUsageSummaries,
  getEndpointBreakdown,
  getRecentActivity,
};

export const GET = createUsageGetHandler(deps);
