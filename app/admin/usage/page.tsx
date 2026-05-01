'use client';

import { useEffect } from 'react';
import { useAdminAuthContext, useUsageStats } from '@/features/admin/model';
import { DateRangeFilter, UserUsageTable, EndpointBreakdown, BudgetProgressBar } from '@/features/admin/ui';

export default function AdminUsagePage() {
  const { password } = useAdminAuthContext();
  const { data, loading, error, fetchUsageStats } = useUsageStats(password);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    fetchUsageStats(start.toISOString(), end.toISOString());
  }, [fetchUsageStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">사용량 분석</h2>
        <DateRangeFilter onFilter={fetchUsageStats} />
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="py-12 text-center text-sm text-stone-400">로딩 중...</div>
      )}
      {data && (
        <>
          <BudgetProgressBar estimatedCost={data.estimatedCost} />
          <EndpointBreakdown endpoints={data.endpoints} />
          <UserUsageTable users={data.users} />
        </>
      )}
    </div>
  );
}
