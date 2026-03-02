'use client';

import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, onExitComplete, title, children, className }: BottomSheetProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out"
        />

        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 outline-none',
            'data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down',
            'md:flex md:justify-center',
          )}
          aria-describedby={undefined}
          onAnimationEnd={(e) => {
            if (e.animationName === 'sheet-down') onExitComplete?.();
          }}
        >
          <div
            className={cn(
              'flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl',
              'md:max-w-2xl',
              className,
            )}
          >
            {/* Handle bar */}
            <div className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-stone-300" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <DialogPrimitive.Title className="text-base font-semibold text-stone-900">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                aria-label="닫기"
              >
                <X size={20} />
              </DialogPrimitive.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {children}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
