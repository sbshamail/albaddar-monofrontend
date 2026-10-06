import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface DropdownSkeletonProps {
  /** Sized like a real trigger (e.g. NativeSelect/Button) — override the
   * width per use case, same as you'd size the real control. */
  className?: string;
}

/** A single closed dropdown/select trigger — hugs its content width by
 * default rather than stretching, same as the real control would. */
export function DropdownSkeleton({ className }: DropdownSkeletonProps) {
  return <Skeleton className={cn("h-9 w-32 rounded-md", className)} />;
}
