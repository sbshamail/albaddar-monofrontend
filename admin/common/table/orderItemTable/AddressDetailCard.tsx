import { Mail, MapPin, Phone, User } from "lucide-react";

import { cn } from "@deep-ecommerce/shared/lib/utils";
import { orderShippingAddress } from "@deep-ecommerce/shared/types/order_types";

function Field({
  icon: Icon,
  label,
  value,
  wrap = false,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  /** Long, unpredictable-length values (the full address) shouldn't be
   * clipped with an ellipsis the way a phone/email always fits — this lets
   * them wrap onto multiple lines instead. */
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            wrap ? "whitespace-normal" : "truncate",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/** Shown in OrderItemTable's expandable row — the shipping address snapshot
 * (see AGENTS.md: Order.shipping_address is a JSON snapshot, not a live
 * UserAddress reference, so this always reflects what was true at order
 * time, even if the customer edits/deletes their saved address later). */
export default function AddressDetailCard({
  address,
  className,
}: {
  address: orderShippingAddress | null | undefined;
  /** Overrides the default spacing (`m-3`, sized for sitting inside the
   * table's expandable row) — pass e.g. no margin when this is one section
   * among several inside a modal body instead. */
  className?: string;
}) {
  if (!address) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No shipping address recorded for this order.
      </div>
    );
  }

  const fullAddress = [
    address.details,
    address.city,
    address.region,
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={cn(
        "m-3 rounded-lg border border-border bg-muted/30 p-4",
        className,
      )}
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Shipping details
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field icon={User} label="Recipient" value={address.person_name || "—"} />
        <Field icon={Phone} label="Phone" value={address.phone || "—"} />
        {address.email && (
          <Field icon={Mail} label="Email" value={address.email} />
        )}
      </div>
      <Field
        icon={MapPin}
        label="Address"
        value={fullAddress || "—"}
        wrap
        className="mt-4 border-t border-border pt-4"
      />
    </div>
  );
}
