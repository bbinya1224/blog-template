'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { OverlayContextValue, OverlayId } from './types';

export const OverlayContext = createContext<OverlayContextValue | null>(null);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [overlayMap, setOverlayMap] = useState<
    Map<OverlayId, React.ReactElement>
  >(new Map());

  const mount = (id: OverlayId, element: React.ReactElement) => {
    setOverlayMap((prev) => {
      const next = new Map(prev);
      next.set(id, element);
      return next;
    });
  };

  const unmount = (id: OverlayId) => {
    setOverlayMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    if (overlayMap.size > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [overlayMap.size]);

  return (
    <OverlayContext.Provider value={{ mount, unmount }}>
      {children}
      {Array.from(overlayMap.entries()).map(([id, element], index) => {
        const zIndex = 50 + index * 10;
        return (
          <div key={id} style={{ zIndex }}>
            {element}
          </div>
        );
      })}
    </OverlayContext.Provider>
  );
}
