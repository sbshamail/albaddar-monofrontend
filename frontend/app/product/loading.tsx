import { Skeleton } from "@deep-ecommerce/shared/components/ui/skeleton";
import { CardSkeleton, DropdownSkeleton } from "@deep-ecommerce/shared/components/cui/loader";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 md:flex">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </aside>
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <DropdownSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
