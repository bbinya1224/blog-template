'use client';

import { cn } from '@/shared/lib/utils';
import type { ConversationStep } from '../model/types';

const STEPS: { key: ConversationStep; label: string; icon: string }[] = [
  { key: 'onboarding', label: '시작', icon: '1' },
  { key: 'style-check', label: '스타일', icon: '2' },
  { key: 'topic-select', label: '주제', icon: '3' },
  { key: 'info-gathering', label: '정보', icon: '4' },
  { key: 'confirmation', label: '확인', icon: '5' },
  { key: 'complete', label: '완료', icon: '6' },
];

interface ProgressBarProps {
  currentStep: ConversationStep;
  className?: string;
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const currentIndex = STEPS.findIndex(
    (s) =>
      s.key === currentStep ||
      (currentStep === 'style-setup' && s.key === 'style-check') ||
      (currentStep === 'generating' && s.key === 'confirmation') ||
      (currentStep === 'review-edit' && s.key === 'confirmation')
  );

  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className={cn('px-6 pt-5 pb-4', className)}>
      {/* Minimal progress bar */}
      <div className="max-w-md mx-auto">
        {/* Step labels - only show current */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone-400 tracking-wide uppercase">
            {STEPS[currentIndex]?.label || '시작'}
          </span>
          <span className="text-xs text-stone-300">
            {currentIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Progress track */}
        <div className="relative h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
