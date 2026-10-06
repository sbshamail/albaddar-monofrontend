"use client";

import { CheckCircle2, Percent, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Switch } from "@deep-ecommerce/shared/components/ui/switch";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { setBadgeLoading } from "@deep-ecommerce/shared/providers/LoaderContext";

const FILTERS = [
  { key: "is_featured", label: "Featured", Icon: Star },
  { key: "is_sale", label: "On Sale", Icon: Percent },
  { key: "is_active", label: "InActive only", Icon: CheckCircle2 },
] as const;

// Toggling any of these is a server refetch (router.push into the products
// Server Component), not a client-side filter over already-fetched rows —
// is_active/is_featured are real columns (columnFilters) but is_sale is a
// computed Product.is_sale property the generic filter engine can't
// resolve, so the page builds it as a deepFilters entry instead. Both are
// wired server-side in app/(dashboard)/products/page.tsx; this component
// only ever reads/writes the URL.
export default function ProductBooleanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // isPending is genuine external state (the transition scheduler), not
  // derived from props — mirroring it into the shared badge loader is a
  // legitimate effect, matching frontend/common/product/useFilterNavigation.ts.
  useEffect(() => {
    setBadgeLoading("Filtering products", isPending);
    return () => setBadgeLoading("Filtering products", false);
  }, [isPending]);

  const toggle = (key: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) params.set(key, "true");
    else params.delete(key);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1.5">
      {FILTERS.map(({ key, label, Icon }) => {
        const checked = searchParams.get(key) === "true";
        return (
          <label
            key={key}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors select-none",
              checked
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className={cn("size-3.5", checked && "fill-primary")} />
            {label}
            <Switch
              checked={checked}
              onCheckedChange={(v) => toggle(key, v)}
              disabled={isPending}
            />
          </label>
        );
      })}
    </div>
  );
}
