'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

interface SidebarContextValue {
  isExpanded: boolean;
  showLabels: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = 'oroti-sidebar';

function getIsDesktop() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage / screen size
  useEffect(() => {
    const isDesktop = getIsDesktop();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    } else {
      setIsExpanded(isDesktop);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage (desktop only)
  useEffect(() => {
    if (!hydrated) return;
    if (getIsDesktop()) {
      localStorage.setItem(STORAGE_KEY, String(isExpanded));
    }
  }, [isExpanded, hydrated]);

  // Listen for screen resize: collapse on mobile
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        setIsExpanded(false);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const [showLabels, setShowLabels] = useState(false);
  const initializedRef = useRef(false);

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

  const toggle = useCallback(() => setIsExpanded((v) => !v), []);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  return (
    <SidebarContext.Provider value={{ isExpanded, showLabels, toggle, expand, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
