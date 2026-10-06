"use client";

import { Modal } from "@deep-ecommerce/shared/components/ui/modal";
import { currencyFormatter, formatDate } from "@deep-ecommerce/shared/utility/helpers";
import {
  OrderItemRead,
  OrderItemStatus,
} from "@deep-ecommerce/shared/types/order_types";
import AddressDetailCard from "./AddressDetailCard";
import OrderItemStatusSelect from "./OrderItemStatusSelect";

interface OrderDetailModalProps {
  open: boolean;
  close: () => void;
  row: OrderItemRead | null;
  canUpdate: boolean;
  onStatusUpdated: (id: number, status: OrderItemStatus) => void;
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/**
 * Full detail view for one order item — opened by clicking the product name
 * in OrderItemTable. Reuses AddressDetailCard (also shown inline in the
 * table's expandable row) and OrderItemStatusSelect (also the table's own
 * inline status editor) rather than duplicating either, so there's exactly
 * one place that knows how to render/edit each — this is just a fuller
 * layout composing them for admins who want the whole picture without
 * scrolling a wide table.
 */
const OrderDetailModal = ({
  open,
  close,
  row,
  canUpdate,
  onStatusUpdated,
}: OrderDetailModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title={row?.product_name ?? "Order item"}
      description={row ? `Order #${row.order_id}` : undefined}
      width={{ default: 640, min: 420, max: 860 }}
    >
      {row && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {row.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.image.original}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground">
                {row.product_name}
              </h3>
              {row.variant_attributes && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {Object.entries(row.variant_attributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
                </p>
              )}
              <div className="mt-2">
                <OrderItemStatusSelect
                  id={row.id}
                  status={row.status}
                  canUpdate={canUpdate}
                  onUpdated={onStatusUpdated}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
            <InfoField label="Order #" value={row.order_id} />
            <InfoField label="Quantity" value={row.quantity} />
            <InfoField
              label="Price"
              value={currencyFormatter(row.price, "PKR", "en-PK")}
            />
            {row.actual_price != null && row.actual_price !== row.price && (
              <InfoField
                label="Original price"
                value={
                  <span className="line-through">
                    {currencyFormatter(row.actual_price, "PKR", "en-PK")}
                  </span>
                }
              />
            )}
            {row.weight != null && (
              <InfoField label="Weight" value={`${row.weight} kg`} />
            )}
            <InfoField label="Placed on" value={formatDate(row.created_at)} />
          </div>

          <AddressDetailCard address={row.shipping_address} className="m-0" />
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
