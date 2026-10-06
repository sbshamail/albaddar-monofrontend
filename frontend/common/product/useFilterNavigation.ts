"use client";

import { setBadgeLoading } from "@deep-ecommerce/shared/providers/LoaderContext";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

/**
 * Filter/sort/search changes on the product list are server re-renders
 * (router.push into a Server Component), not a fetch this file controls
 * directly — React's useTransition is the right primitive for "is this
 * navigation still in flight", and its `isPending` is genuine external
 * state (the transition scheduler), not something derivable from props —
 * mirroring that into the existing shared badge loader is a legitimate
 * effect, not the "sync state from a prop" case the set-state-in-effect
 * rule targets. Without this, applying a filter gives no feedback at all
 * until the new page finishes loading, which reads as "did that work?".
 */
export function useFilterNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBadgeLoading("Updating results", isPending);
    return () => setBadgeLoading("Updating results", false);
  }, [isPending]);

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return { navigate, isPending };
}
