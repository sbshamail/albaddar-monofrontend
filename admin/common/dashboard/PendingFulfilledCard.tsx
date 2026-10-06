import { Card, CardContent, CardHeader, CardTitle } from "@deep-ecommerce/shared/components/ui/card";
import { cn } from "@deep-ecommerce/shared/lib/utils";

// "Pending" groups pending + processing (not yet out the door), "Fulfilled"
// groups shipped + delivered (customer has it or it's on the way).
// Cancelled is shown separately rather than folded into either bucket.
export default function PendingFulfilledCard({
  statusCounts,
}: {
  statusCounts: Record<string, number>;
}) {
  const pending = (statusCounts.pending ?? 0) + (statusCounts.processing ?? 0);
  const fulfilled = (statusCounts.shipped ?? 0) + (statusCounts.delivered ?? 0);
  const cancelled = statusCounts.cancelled ?? 0;
  const total = pending + fulfilled + cancelled;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const fulfilledPct = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending vs Fulfilled</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {total === 0 ? (
          <p className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No order items yet
          </p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-amber-500" style={{ width: `${pendingPct}%` }} />
              <div className="h-full bg-emerald-500" style={{ width: `${fulfilledPct}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="Pending" value={pending} dotClassName="bg-amber-500" />
              <Stat label="Fulfilled" value={fulfilled} dotClassName="bg-emerald-500" />
              <Stat label="Cancelled" value={cancelled} dotClassName="bg-rose-500" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  dotClassName,
}: {
  label: string;
  value: number;
  dotClassName: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className={cn("size-2 rounded-full", dotClassName)} />
        {label}
      </div>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}
