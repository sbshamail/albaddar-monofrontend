import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface SideMenuSkeletonProps {
  className?: string;
  items?: number;
  /** Set false for a menu with no leading icon per row. */
  withIcon?: boolean;
}

/** A vertical nav list: icon + label rows, label widths varied so it
 * doesn't read as one uniform, obviously-fake block. */
export function SideMenuSkeleton({
  className,
  items = 6,
  withIcon = true,
}: SideMenuSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-2 py-2">
          {withIcon && <Skeleton className="size-4 shrink-0 rounded" />}
          <Skeleton className={cn("h-3.5 rounded", i % 3 === 0 ? "w-2/3" : "w-full")} />
        </div>
      ))}
    </div>
  );
}
