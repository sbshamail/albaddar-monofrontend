import { Skeleton } from "@deep-ecommerce/shared/components/ui/skeleton";

// Shown instantly while a page.tsx under (dashboard) does uncached data
// fetching (e.g. products/page.tsx's live backend calls) — Next wraps
// page.tsx (not layout.tsx) in a Suspense boundary for this automatically.
export default function DashboardLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
