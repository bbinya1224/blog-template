import { cn } from '@/shared/lib/utils';

export function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-stone-200/50', className)}
    />
  );
}
