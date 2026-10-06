import { cn } from "../../../lib/utils";
import { Skeleton } from "../../ui/skeleton";

export interface CardSkeletonProps {
  /** Sizes the whole card — pass a width/aspect utility to fit your grid,
   * same as you'd size a real card. Defaults to hugging its parent. */
  className?: string;
  /** Override just the image block (defaults to a square). */
  imageClassName?: string;
  /** Number of text lines under the image (title + price, etc.). */
  lines?: number;
}

/** Generic image-on-top, text-lines-below card skeleton — a product card,
 * a user card, a blog-post card, whatever shares that shape. */
export function CardSkeleton({ className, imageClassName, lines = 2 }: CardSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className={cn("aspect-square w-full rounded-lg", imageClassName)} />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3.5 rounded", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
