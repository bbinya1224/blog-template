'use client';

import { useEffect, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { cn } from '@/shared/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!closeOnOverlayClick) {
      const handlePointerDownOutside = (e: Event) => {
        e.preventDefault();
      };

      const portal = document.querySelector('[data-radix-portal]');
      if (portal) {
        portal.addEventListener('pointerdown', handlePointerDownOutside);
        return () => {
          portal.removeEventListener('pointerdown', handlePointerDownOutside);
        };
      }
    }
  }, [closeOnOverlayClick, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(SIZE_CLASSES[size], className)}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={() => {
          onClose();
        }}
        aria-describedby={undefined}
      >
        {!showCloseButton && (
          <style jsx global>{`
            [data-radix-portal] button[data-state] {
              display: none;
            }
          `}</style>
        )}

        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        <div className={cn(!title && 'pt-6')}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
