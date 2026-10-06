"use client";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@deep-ecommerce/shared/components/ui/confirm-dialog";
import { Modal } from "@deep-ecommerce/shared/components/ui/modal";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";

import ProductViewDetails from "./ProductViewDetails";

interface ProductRowActionsProps {
  product: ProductRead;
  onDeleted: (id: number) => void;
}

const ProductRowActions = ({ product, onDeleted }: ProductRowActionsProps) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/product/delete/${product.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.detail ?? "Failed to delete product");
      return;
    }
    setDeleteOpen(false);
    onDeleted(product.id);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        title="View"
        onClick={() => setViewOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Eye size={15} />
      </button>
      <button
        type="button"
        title="Delete"
        onClick={() => setDeleteOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={15} />
      </button>

      <Modal
        open={viewOpen}
        onOpenChange={setViewOpen}
        title={product.name}
        resizable
        width={{ default: 640, min: 420, max: 960 }}
      >
        <ProductViewDetails product={product} />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${product.name}"?`}
        description="This can't be undone."
        onConfirm={handleDelete}
        loading={deleting}
      >
        {error && <p className="text-sm text-destructive">{error}</p>}
      </ConfirmDialog>
    </div>
  );
};

export default ProductRowActions;
