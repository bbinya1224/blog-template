'use client';

import { useState, useEffect } from 'react';

interface StaggerRevealOptions {
  delayMs?: number;
  staggerMs: number;
  showAllWhenDisabled?: boolean;
}

export function useStaggerReveal(
  totalSteps: number,
  enabled: boolean,
  { delayMs = 0, staggerMs, showAllWhenDisabled = true }: StaggerRevealOptions,
): number {
  const [step, setStep] = useState(
    enabled ? 0 : showAllWhenDisabled ? totalSteps : 0,
  );

  useEffect(() => {
    if (!enabled) {
      setStep(showAllWhenDisabled ? totalSteps : 0);
      return;
    }

    setStep(0);
    if (totalSteps <= 0) return;

    let current = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const delayId = setTimeout(() => {
      intervalId = setInterval(() => {
        current++;
        setStep(current);
        if (current >= totalSteps) clearInterval(intervalId);
      }, staggerMs);
    }, delayMs);

    return () => {
      clearTimeout(delayId);
      clearInterval(intervalId);
    };
  }, [enabled, totalSteps, delayMs, staggerMs, showAllWhenDisabled]);

  return step;
}
