import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface MenuSkeletonProps {
  className?: string;
  items?: number;
}

/** A dropdown/popover menu's contents — plain text-line rows, no icon.
 * For a mega menu or select-list loading state. */
export function MenuSkeleton({ className, items = 5 }: MenuSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-1", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5 rounded", i % 2 === 0 ? "w-3/4" : "w-1/2")} />
      ))}
    </div>
  );
}
