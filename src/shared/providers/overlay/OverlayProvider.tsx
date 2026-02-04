'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { OverlayContextValue, OverlayId } from './types';

export const OverlayContext = createContext<OverlayContextValue | null>(null);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [overlayMap, setOverlayMap] = useState<
    Map<OverlayId, React.ReactElement>
  >(new Map());

  const mount = useCallback((id: OverlayId, element: React.ReactElement) => {
    setOverlayMap((prev) => {
      const next = new Map(prev);
      next.set(id, element);
      return next;
    });
  }, []);

  const unmount = useCallback((id: OverlayId) => {
    setOverlayMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

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

  const contextValue = useMemo(() => ({ mount, unmount }), [mount, unmount]);

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
      {Array.from(overlayMap.entries()).map(([id, element], index) => {
        const overlayZIndex = 50 + index * 10;
        return (
          <div key={id} style={{ position: 'relative', zIndex: overlayZIndex, isolation: 'isolate' }}>
            {element}
          </div>
        );
      })}
    </OverlayContext.Provider>
  );
}
