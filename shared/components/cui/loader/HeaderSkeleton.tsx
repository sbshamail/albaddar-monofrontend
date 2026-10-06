import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface HeaderSkeletonProps {
  className?: string;
  /** Number of nav-link-shaped blocks between the logo and the icons. */
  navItems?: number;
  /** Number of icon-shaped blocks on the right (account, cart, etc.). */
  icons?: number;
}

/** A top bar: logo block, a row of nav-link blocks, a few icon circles. */
export function HeaderSkeleton({ className, navItems = 3, icons = 2 }: HeaderSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      <Skeleton className="h-6 w-24 shrink-0 rounded" />
      <div className="hidden flex-1 items-center gap-4 md:flex">
        {Array.from({ length: navItems }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16 rounded" />
        ))}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {Array.from({ length: icons }).map((_, i) => (
          <Skeleton key={i} className="size-9 rounded-full" />
        ))}
      </div>
    </div>
  );
}
