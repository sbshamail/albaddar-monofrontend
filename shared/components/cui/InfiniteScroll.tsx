"use client";

import type { ReactNode } from "react";

import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Spinner } from "../ui/spinner";

export interface InfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /** The already-rendered list/grid — this component only adds the
   * scroll-trigger sentinel and the trailing state below it, nothing about
   * layout or what a single item looks like. */
  children: ReactNode;
  loadingIndicator?: ReactNode;
  /** Pass `null` to render nothing once the list is exhausted. */
  endMessage?: ReactNode | null;
  className?: string;
  rootMargin?: string;
}

/**
 * Wraps any already-rendered paginated list and makes it load-on-scroll:
 * hand it `hasMore`/`loading`/`onLoadMore` from wherever your data lives
 * (a hook, a reducer, whatever fetches your next page) and it handles the
 * "when does the next page start loading" and "what shows at the end"
 * mechanics. No knowledge of what the items are — products, orders, users,
 * anything with a page/total shape works the same way.
 */
export function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  loadingIndicator,
  endMessage,
  className,
  rootMargin,
}: InfiniteScrollProps) {
  const sentinelRef = useInfiniteScroll(onLoadMore, {
    enabled: hasMore && !loading,
    rootMargin,
  });

  return (
    <div className={className}>
      {children}
      {hasMore ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          {loading && (loadingIndicator ?? <Spinner />)}
        </div>
      ) : (
        endMessage !== null && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {endMessage ?? "No more items to show"}
          </p>
        )
      )}
    </div>
  );
}
