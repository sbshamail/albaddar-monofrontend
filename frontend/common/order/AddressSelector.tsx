"use client";

import { cn } from "@deep-ecommerce/shared/lib/utils";
import { AddressDetail, UserAddress } from "@/common/data/address.client";
import AddressForm from "./AddressForm";

function formatAddress(a: AddressDetail): string {
  return [a.person_name, a.details, a.city, a.region, a.postal_code, a.country]
    .filter(Boolean)
    .join(", ");
}

/**
 * Purely controlled/presentational — all state (the fetched address list,
 * which one is picked, the draft for a new one) lives in the parent
 * (OrderForm / the account page), so this has no fetch and no effects of
 * its own. When there are no existing addresses at all, there's nothing to
 * pick from, so it skips straight to the create form.
 */
export default function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  draft,
  onDraftChange,
}: {
  addresses: UserAddress[];
  selectedId: number | "new";
  onSelect: (id: number | "new") => void;
  draft: AddressDetail;
  onDraftChange: (next: AddressDetail) => void;
}) {
  if (addresses.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Shipping address</h3>
        <AddressForm value={draft} onChange={onDraftChange} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Shipping address</h3>

      {addresses.map((addr) => (
        <label
          key={addr.id}
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm",
            selectedId === addr.id ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <input
            type="radio"
            name="shipping-address"
            checked={selectedId === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-0.5"
          />
          <span>
            {formatAddress(addr.address)}
            {addr.default === 1 && (
              <span className="ml-1.5 text-xs text-muted-foreground">(default)</span>
            )}
          </span>
        </label>
      ))}

      <label
        className={cn(
          "flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm",
          selectedId === "new" ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <input
          type="radio"
          name="shipping-address"
          checked={selectedId === "new"}
          onChange={() => onSelect("new")}
          className="mt-0.5"
        />
        <span>Add a new address</span>
      </label>

      {selectedId === "new" && <AddressForm value={draft} onChange={onDraftChange} />}
    </div>
  );
}
