"use client";
import { useState } from "react";

import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";
import { ORDER_ITEM_STATUSES, OrderItemStatus } from "@deep-ecommerce/shared/types/order_types";

interface OrderItemStatusSelectProps {
  id: number;
  status: OrderItemStatus;
  canUpdate: boolean;
  onUpdated: (id: number, status: OrderItemStatus) => void;
}

const statusClass: Record<OrderItemStatus, string> = {
  pending: "text-muted-foreground",
  processing: "text-blue-600",
  shipped: "text-amber-600",
  delivered: "text-green-600",
  cancelled: "text-destructive",
};

const OrderItemStatusSelect = ({
  id,
  status,
  canUpdate,
  onUpdated,
}: OrderItemStatusSelectProps) => {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (next: OrderItemStatus) => {
    const prev = value;
    setValue(next);
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/order-item/update-status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.detail ?? "Failed to update status");
      setValue(prev);
      return;
    }
    onUpdated(id, next);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <NativeSelect
        size="sm"
        className={statusClass[value]}
        value={value}
        disabled={!canUpdate || saving}
        onChange={(e) => handleChange(e.target.value as OrderItemStatus)}
      >
        {ORDER_ITEM_STATUSES.map((s) => (
          <NativeSelectOption key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

export default OrderItemStatusSelect;
