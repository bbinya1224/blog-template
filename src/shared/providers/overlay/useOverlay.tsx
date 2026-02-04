'use client';

import { useContext, useEffect, useId, useRef } from 'react';
import { OverlayContext } from './OverlayProvider';
import { OverlayController } from './OverlayController';
import type { CreateOverlayElement, OverlayControlRef } from './types';

interface UseOverlayOptions {
  exitOnUnmount?: boolean;
}

export function useOverlay({ exitOnUnmount = true }: UseOverlayOptions = {}) {
  const context = useContext(OverlayContext);

  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider');
  }

  const id = useId();
  const controllerRef = useRef<OverlayControlRef>(null);

  useEffect(() => {
    return () => {
      if (exitOnUnmount) {
        context.unmount(id);
      }
    };
  }, [exitOnUnmount, id, context]);

  return {
    open: (element: CreateOverlayElement) => {
      context.mount(
        id,
        <OverlayController
          ref={controllerRef}
          element={element}
          onExit={() => context.unmount(id)}
        />,
      );
    },

    close: () => controllerRef.current?.close(),

    exit: () => context.unmount(id),
  };
}
