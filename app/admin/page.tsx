'use client';

import { useEffect } from 'react';
import { useAdminAuthContext, useWhitelist, useUsageStats } from '@/features/admin/model';
import { DashboardCards } from '@/features/admin/ui';
import type { RecentActivity } from '@/features/admin/model';

export default function AdminDashboardPage() {
  const { password } = useAdminAuthContext();
  const { users, fetchUsers } = useWhitelist(password);
  const { data, fetchUsageStats } = useUsageStats(password);

  useEffect(() => {
    fetchUsers();
    fetchUsageStats();
  }, [fetchUsers, fetchUsageStats]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-stone-900">대시보드</h2>
      <DashboardCards userCount={users.length} summary={data?.summary ?? null} />
      {data?.recent && data.recent.length > 0 && (
        <RecentActivityTable items={data.recent} />
      )}
    </div>
  );
}

function RecentActivityTable({ items }: { items: RecentActivity[] }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-stone-900">최근 활동</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-stone-500">
              <th className="px-6 py-3 font-medium">사용자</th>
              <th className="px-6 py-3 font-medium">엔드포인트</th>
              <th className="px-6 py-3 font-medium">모델</th>
              <th className="px-6 py-3 text-right font-medium">입력</th>
              <th className="px-6 py-3 text-right font-medium">출력</th>
              <th className="px-6 py-3 font-medium">시간</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-stone-50 last:border-0">
                <td className="px-6 py-3 font-medium text-stone-900">{item.user_email}</td>
                <td className="px-6 py-3 text-stone-600">{item.endpoint}</td>
                <td className="px-6 py-3 text-stone-600">{item.model}</td>
                <td className="px-6 py-3 text-right text-stone-600">
                  {item.input_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right text-stone-600">
                  {item.output_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-stone-400">
                  {new Date(item.created_at).toLocaleString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
