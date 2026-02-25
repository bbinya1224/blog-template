'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@/shared/lib/utils';

function Popover({ children }: { children: ReactNode }) {
  return <PopoverPrimitive.Root>{children}</PopoverPrimitive.Root>;
}

type PopoverTriggerProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
>;

function PopoverTrigger({ children, className, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger className={className} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
}

interface PopoverContentProps
  extends Omit<
    ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup>,
    'className'
  > {
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

function PopoverContent({
  children,
  className,
  side = 'bottom',
  align = 'end',
  sideOffset = 4,
  ...popupProps
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          {...popupProps}
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-stone-200 bg-white p-1 shadow-lg',
            'origin-[var(--transform-origin)] transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
