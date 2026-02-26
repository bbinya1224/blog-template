'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useIsDesktop } from '@/shared/lib/hooks';

interface SidebarContextValue {
  isExpanded: boolean;
  isDesktop: boolean;
  showLabels: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = 'oroti-sidebar';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isDesktop = useIsDesktop();
  const hydratedRef = useRef(false);

  const [showLabels, setShowLabels] = useState(false);
  const initializedRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydration + responsive layout sync */

  // Hydrate from localStorage / screen size (mount-only via ref guard)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    } else {
      setIsExpanded(isDesktop);
    }
    setHydrated(true);
  }, [isDesktop]);

  // Persist to localStorage (desktop only)
  useEffect(() => {
    if (!hydrated) return;
    if (isDesktop) {
      localStorage.setItem(STORAGE_KEY, String(isExpanded));
    }
  }, [isExpanded, hydrated, isDesktop]);

  // Collapse on mobile resize
  useEffect(() => {
    if (!isDesktop) {
      setIsExpanded(false);
    }
  }, [isDesktop]);

  // Label animation sync with expand state
  useEffect(() => {
    if (!hydrated) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      setShowLabels(isExpanded);
      return;
    }
    if (isExpanded) {
      const timer = setTimeout(() => setShowLabels(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLabels(false);
    }
  }, [isExpanded, hydrated]);

  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = useCallback(() => setIsExpanded((v) => !v), []);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  const value = useMemo(
    () => ({ isExpanded, isDesktop, showLabels, toggle, expand, collapse }),
    [isExpanded, isDesktop, showLabels, toggle, expand, collapse],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
