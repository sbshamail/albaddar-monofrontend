import { Skeleton } from "@deep-ecommerce/shared/components/ui/skeleton";
import { BodySkeleton } from "@deep-ecommerce/shared/components/cui/loader";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6">
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <BodySkeleton className="pt-4" lines={3} />
        </div>
      </div>
    </div>
  );
}
