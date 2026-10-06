"use client";
import { listOrders, OrderRead } from "@/common/data/order.client";
import { formatPrice } from "@/common/product/priceHelpers";
import { Badge } from "@deep-ecommerce/shared/components/ui/badge";
import { formatDate } from "@deep-ecommerce/shared/utility/helpers";
import { useEffect, useState } from "react";
export function OrdersSection() {
  const [orders, setOrders] = useState<OrderRead[] | null>(null);

  // One-time fetch on mount — genuine external-system sync, not derived
  // state.
  useEffect(() => {
    listOrders().then(setOrders);
  }, []);

  if (orders === null) {
    return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You haven&apos;t placed any orders yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col gap-3 rounded-md border border-border p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Order #{order.order_number}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(order.total)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image.original}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.product_name}
                  </p>
                  {item.variant_attributes &&
                    Object.keys(item.variant_attributes).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant_attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <Badge
                  variant={statusBadgeVariant(item.status)}
                  className="capitalize"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" {
  if (status === "cancelled") return "destructive";
  if (status === "delivered") return "default";
  return "secondary";
}
