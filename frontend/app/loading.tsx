import { Skeleton } from "@deep-ecommerce/shared/components/ui/skeleton";
import { CardSkeleton } from "@deep-ecommerce/shared/components/cui/loader";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6">
      <Skeleton className="h-64 w-full rounded-lg md:h-80" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
