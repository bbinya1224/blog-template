'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 100;
const USER_SCROLL_DEBOUNCE_MS = 150;

export function useScrollToBottom<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);
  const isUserScrollingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);

  const syncIsAtBottom = useCallback((value: boolean) => {
    setIsAtBottom(value);
    isAtBottomRef.current = value;
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;
    isProgrammaticScrollRef.current = true;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'instant',
    });
  }, []);

  // Track user scroll events (ignore programmatic scrolls)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        return;
      }

      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeout);
      syncIsAtBottom(checkIfAtBottom());

      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, USER_SCROLL_DEBOUNCE_MS);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [checkIfAtBottom, syncIsAtBottom]);

  // Auto-scroll when DOM content changes (streaming text, new messages)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollIfNeeded = () => {
      if (!isAtBottomRef.current || isUserScrollingRef.current) return;

      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        isProgrammaticScrollRef.current = true;
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'instant',
        });
        syncIsAtBottom(true);
      });
    };

    const resizeObserver = new ResizeObserver(scrollIfNeeded);
    resizeObserver.observe(container);

    const mutationObserver = new MutationObserver((mutations) => {
      scrollIfNeeded();

      // Observe newly added children for resize
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            resizeObserver.observe(node);
          }
        }
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Observe initial children
    for (const child of container.children) {
      resizeObserver.observe(child);
    }

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [syncIsAtBottom]);

  return { containerRef, isAtBottom, scrollToBottom };
}
