"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import Table from "@deep-ecommerce/shared/components/cui/table";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { SheetPanel } from "@deep-ecommerce/shared/components/ui/sheet-panel";
import { ProductVariantBase } from "@deep-ecommerce/shared/types/product_types";
import { ColumnType } from "@deep-ecommerce/shared/types/table_types";

import VariantForm from "./VariantForm";
import VariantRowActions from "./VariantRowActions";

interface ProductVariantTableProps {
  productId: number;
  data: ProductVariantBase[];
  /** Fires with the current variant selection whenever it changes — the
   * parent product row uses this to deselect itself once you're picking
   * specific variants instead of the whole product. */
  onSelectionChange?: (rows: ProductVariantBase[]) => void;
  /** Fires after a variant is created or updated, with the saved record. */
  onVariantSaved?: (variant: ProductVariantBase) => void;
  onVariantDeleted?: (id: number) => void;
}

// ProductRead.variants (the list/expandable-row view) is ProductVariantBase[]
// — it doesn't carry product_id/created_at/updated_at, only ProductSingleRead
// (single product read/update) does. This table only renders pricing/stock
// fields, all present on the base shape, so it takes that directly.
const ProductVariantTable = ({
  productId,
  data,
  onVariantSaved,
  onVariantDeleted,
}: ProductVariantTableProps) => {
  const [createOpen, setCreateOpen] = useState(false);

  const columns: ColumnType<ProductVariantBase>[] = [
    {
      title: "image",
      accessor: "image.original",
      render: ({ cell }) =>
        cell ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cell as string}
            alt=""
            className="h-8 w-8 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      title: "price",
      accessor: "price",
    },
    {
      title: "discount_price",
      accessor: "discount_price",
      type: "currency",
    },
    {
      title: "Stock",
      accessor: "stock",
    },
    {
      title: "is_in_stock",
      render: ({ cell }) => (cell ? "Yes" : "No"),
    },
    {
      title: "sku",
      accessor: "sku",
    },
    {
      title: "Attributes",
      accessor: "attributes",
      render: ({ cell }) => {
        const attributes = typeof cell === "string" ? JSON.parse(cell) : cell;
        if (!attributes || typeof attributes !== "object") {
          return <span>—</span>;
        }

        return (
          <div className="space-y-1">
            {Object.entries(attributes as Record<string, unknown>).map(
              ([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ),
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      render: ({ row }) =>
        row && (
          <VariantRowActions
            productId={productId}
            variant={row}
            onSaved={onVariantSaved}
            onDeleted={onVariantDeleted}
          />
        ),
    },
  ];

  return (
    <div className="mx-2 overflow-hidden rounded-b-2xl border-2 border-t-0 border-foreground/50">
      <Table<ProductVariantBase>
        columns={columns}
        data={data}
        total={1}
        rowId="id"
        striped
      >
        <Table.Body />
      </Table>

      <div className="border-t border-foreground/50 p-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={14} />
          Add variant
        </Button>
      </div>

      <SheetPanel
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add variant"
        resizable
        width={{ default: 480, min: 400, max: 720 }}
      >
        <VariantForm
          mode="create"
          productId={productId}
          nextPosition={data.length}
          onSuccess={(created) => {
            onVariantSaved?.(created);
            setCreateOpen(false);
          }}
          close={() => setCreateOpen(false)}
        />
      </SheetPanel>
    </div>
  );
};

export default ProductVariantTable;
