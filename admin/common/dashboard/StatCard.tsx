import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@deep-ecommerce/shared/components/ui/card";
import { cn } from "@deep-ecommerce/shared/lib/utils";

export default function StatCard({
  label,
  value,
  sublabel,
  Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  Icon: LucideIcon;
  accent?: "primary" | "amber" | "emerald" | "sky" | "rose";
}) {
  return (
    <Card className="gap-3">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "amber" && "bg-amber-500/10 text-amber-500",
            accent === "emerald" && "bg-emerald-500/10 text-emerald-500",
            accent === "sky" && "bg-sky-500/10 text-sky-500",
            accent === "rose" && "bg-rose-500/10 text-rose-500",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
