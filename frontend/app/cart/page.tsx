"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/common/cart/CartProvider";
import { formatPrice } from "@/common/product/priceHelpers";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Checkbox } from "@deep-ecommerce/shared/components/ui/checkbox";
import { Skeleton } from "@deep-ecommerce/shared/components/ui/skeleton";

function EmptyState({
  title,
  action,
}: {
  title: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {action}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { carts, loading, updateQuantity, removeItem } = useCart();
  const allItems = carts.flatMap((cart) => cart.items);
  // No auto-select — the customer picks what to check out. When the item
  // set changes (added/removed elsewhere), just drop any selected id that
  // no longer exists rather than re-selecting anything new automatically.
  // Computed during render, not an effect, per this repo's prop→state sync
  // convention.
  const idsKey = allItems.map((item) => item.id).join(",");
  const [prevIdsKey, setPrevIdsKey] = useState(idsKey);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  if (idsKey !== prevIdsKey) {
    setPrevIdsKey(idsKey);
    setSelected((prev) => {
      const validIds = new Set(allItems.map((item) => item.id));
      return new Set(Array.from(prev).filter((id) => validIds.has(id)));
    });
  }

  if (loading && carts.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        action={
          <Button asChild>
            <Link href="/product">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  const toggle = (itemId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const selectedTotal = allItems
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  const checkout = () => {
    router.push(`/checkout?items=${Array.from(selected).join(",")}`);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">Your Cart</h1>

      {carts
        .filter((cart) => cart.items.length > 0)
        .map((cart) => (
          <div key={cart.id} className="flex flex-col gap-3">
            {/* shop name */}
            {/* <h2 className="text-sm font-semibold text-muted-foreground">
              {cart.shop?.name ?? "Shop"}
            </h2> */}
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                    aria-label={`Select ${item.product_name ?? "item"} for checkout`}
                  />
                  <div className="size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image.original}
                        alt={item.product_name ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    {item.variant_attributes && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant_attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          {selected.size} item{selected.size === 1 ? "" : "s"} selected
        </span>
        <span className="text-lg font-bold text-foreground">
          {formatPrice(selectedTotal)}
        </span>
      </div>

      <Button size="lg" disabled={selected.size === 0} onClick={checkout}>
        Checkout
      </Button>
    </div>
  );
}
