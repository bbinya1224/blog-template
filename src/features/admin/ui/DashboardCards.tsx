'use client';

import { Users, Zap, Hash, Database } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { UsageSummary } from '../model/useUsageStats';

interface Props {
  userCount: number;
  summary: UsageSummary | null;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const CARDS = [
  {
    key: 'users',
    label: '등록 사용자',
    icon: Users,
    getValue: (props: Props) => formatNumber(props.userCount),
    color: 'text-blue-600 bg-blue-50',
  },
  {
    key: 'requests',
    label: 'API 호출',
    icon: Zap,
    getValue: (props: Props) => formatNumber(props.summary?.total_requests ?? 0),
    color: 'text-orange-600 bg-orange-50',
  },
  {
    key: 'tokens',
    label: '토큰 소비',
    icon: Hash,
    getValue: (props: Props) =>
      formatNumber(
        (props.summary?.total_input_tokens ?? 0) + (props.summary?.total_output_tokens ?? 0),
      ),
    color: 'text-green-600 bg-green-50',
  },
  {
    key: 'cache',
    label: '캐시 적중',
    icon: Database,
    getValue: (props: Props) => formatNumber(props.summary?.total_cache_read_tokens ?? 0),
    color: 'text-purple-600 bg-purple-50',
  },
] as const;

export function DashboardCards({ userCount, summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, getValue, color }) => (
        <div key={key} className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', color)}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-stone-500">{label}</p>
              <p className="text-2xl font-bold text-stone-900">
                {getValue({ userCount, summary })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
