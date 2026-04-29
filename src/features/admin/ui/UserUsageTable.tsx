'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { UserUsageSummary } from '../model/useUsageStats';

interface Props {
  users: UserUsageSummary[];
}

type SortKey = 'request_count' | 'total_input_tokens' | 'total_output_tokens';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'request_count', label: '요청 수' },
  { key: 'total_input_tokens', label: '입력 토큰' },
  { key: 'total_output_tokens', label: '출력 토큰' },
];

export function UserUsageTable({ users }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total_input_tokens');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...users].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white py-12 text-center text-sm text-stone-400">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-stone-900">사용자별 사용량</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-stone-500">
              <th className="px-6 py-3 font-medium">이메일</th>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className="px-6 py-3 font-medium">
                  <button
                    onClick={() => handleSort(key)}
                    className={cn(
                      'flex items-center gap-1 transition-colors hover:text-stone-900',
                      sortKey === key && 'text-stone-900',
                    )}
                  >
                    {label}
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
              ))}
              <th className="px-6 py-3 font-medium">캐시 생성</th>
              <th className="px-6 py-3 font-medium">캐시 적중</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.user_email} className="border-b border-stone-50 last:border-0">
                <td className="px-6 py-3 font-medium text-stone-900">{user.user_email}</td>
                <td className="px-6 py-3 text-stone-600">
                  {user.request_count.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {user.total_input_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {user.total_output_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {user.total_cache_creation_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-stone-600">
                  {user.total_cache_read_tokens.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
