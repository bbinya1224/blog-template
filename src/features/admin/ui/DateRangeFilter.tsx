'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface Props {
  onFilter: (startDate?: string, endDate?: string) => void;
}

const PRESETS = [
  { label: '오늘', days: 0 },
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '전체', days: -1 },
] as const;

export function DateRangeFilter({ onFilter }: Props) {
  const [activePreset, setActivePreset] = useState<number>(7);

  const handlePreset = (days: number) => {
    setActivePreset(days);
    if (days < 0) {
      onFilter();
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onFilter(start.toISOString(), end.toISOString());
  };

  return (
    <div className="flex gap-2">
      {PRESETS.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => handlePreset(days)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            activePreset === days
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
