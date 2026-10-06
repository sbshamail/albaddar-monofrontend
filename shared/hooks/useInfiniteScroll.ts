"use client";

import { useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  /** Pass `hasMore && !loading` — the observer is torn down entirely while
   * false rather than just no-op'ing, so a finished list stops watching. */
  enabled?: boolean;
  /** How far before the sentinel enters the viewport to fire — a positive
   * margin starts loading the next page slightly ahead of the scroll
   * reaching the bottom, so the user rarely sees a loading gap. */
  rootMargin?: string;
}

/**
 * Fires `onIntersect` whenever the returned ref's element scrolls into
 * view, via IntersectionObserver — no polling, no scroll-event listener,
 * no extra package. This is the plain "detect scroll-to-bottom" mechanism;
 * it knows nothing about pages, items, or data shape, which is what makes
 * it reusable for any paginated list (see components/cui/InfiniteScroll.tsx
 * for the ready-to-use wrapper built on top of this).
 */
export function useInfiniteScroll(
  onIntersect: () => void,
  { enabled = true, rootMargin = "200px" }: UseInfiniteScrollOptions = {},
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Ref, not a dependency — so a new inline `onIntersect` each render
  // doesn't tear down and recreate the observer every time.
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
