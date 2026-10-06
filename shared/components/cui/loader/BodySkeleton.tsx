import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface BodySkeletonProps {
  className?: string;
  /** Number of paragraph lines — the last one is shortened automatically
   * so it reads like real wrapped text, not a uniform block. */
  lines?: number;
}

/** Generic paragraph/body-content skeleton — a description, a bio, any
 * block of running text. */
export function BodySkeleton({ className, lines = 4 }: BodySkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5 rounded", i === lines - 1 ? "w-1/2" : "w-full")} />
      ))}
    </div>
  );
}
