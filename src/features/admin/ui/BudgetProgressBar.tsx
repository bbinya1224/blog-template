'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';

const BUDGET_STORAGE_KEY = 'admin_monthly_budget';

interface Props {
  estimatedCost: number;
}

const getBarColor = (percentage: number): string => {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-orange-500';
  return 'bg-blue-500';
};

const getStatusText = (percentage: number): string => {
  if (percentage >= 100) return '예산 초과';
  if (percentage >= 80) return '예산 주의';
  return '정상';
};

export function BudgetProgressBar({ estimatedCost }: Props) {
  const [budget, setBudget] = useState<number>(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (saved) {
      const parsed = Number(saved);
      setBudget(parsed);
      setInputValue(String(parsed));
    }
  }, []);

  const handleSave = useCallback(() => {
    const value = Number(inputValue);
    if (value > 0) {
      setBudget(value);
      localStorage.setItem(BUDGET_STORAGE_KEY, String(value));
    }
  }, [inputValue]);

  const percentage = budget > 0 ? (estimatedCost / budget) * 100 : 0;
  const clampedWidth = Math.min(percentage, 100);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">월 예산 관리</h3>

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="budget-input" className="text-sm text-stone-600">
          월 예산 ($)
        </label>
        <input
          id="budget-input"
          type="number"
          min="0"
          step="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-32 rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="10"
        />
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-800"
        >
          저장
        </button>
      </div>

      {budget > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">
              ${estimatedCost.toFixed(2)} / ${budget.toFixed(2)}
            </span>
            <span
              className={cn(
                'font-medium',
                percentage >= 100
                  ? 'text-red-600'
                  : percentage >= 80
                    ? 'text-orange-600'
                    : 'text-blue-600',
              )}
            >
              {getStatusText(percentage)} ({percentage.toFixed(1)}%)
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-stone-100"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="예산 사용률"
          >
            <div
              className={cn('h-full rounded-full transition-all', getBarColor(percentage))}
              style={{ width: `${clampedWidth}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
