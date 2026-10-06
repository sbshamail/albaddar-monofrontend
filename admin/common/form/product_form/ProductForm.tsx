"use client";

import { useEffect, useState } from "react";

import { CategoryTreeNode, ProductSingleRead } from "@deep-ecommerce/shared/types/product_types";
import {
  ProductFormValues,
  ProductVariantFormValue,
} from "../schemas/productSchemas";

import { fetching } from "@deep-ecommerce/shared/api/client";
import { ProductFormBody } from "./ProductFormBody";

interface ProductFormProps {
  mode: "create" | "update";
  productId?: number;
  categories: CategoryTreeNode[];
  onSuccess?: (product: ProductSingleRead) => void;
  close?: () => void;
  /** Reports unsaved-changes state so the Sheet/Dialog owning this form can
   * confirm before closing (see ActionType.onDirtyChange). */
  onDirtyChange?: (dirty: boolean) => void;
}

export const emptyVariant: ProductVariantFormValue = {
  price: "1",
  discount_price: "",
  stock: "1",
  weight: "",
  sku: "",
  attributes: [],
  imageFile: null,
  imageUrl: null,
};

const emptyValues: ProductFormValues = {
  name: "",
  short_description: "",
  description: "",
  whats_in_box: "",
  category_id: "",
  is_active: true,
  is_featured: false,
  tags: "",
  variants: [emptyVariant],
  thumbnail: null,
  images: [],
  meta_title: "",
  meta_description: "",
  video_url: "",
};

const toDefaultValues = (product: ProductSingleRead): ProductFormValues => ({
  name: product.name,
  short_description: product.short_description ?? "",
  description: product.description ?? "",
  whats_in_box: product.whats_in_box ?? "",
  category_id: String(product.category.id),
  is_active: product.is_active,
  is_featured: product.is_featured,
  tags: (product.tags ?? []).join(", "),
  thumbnail: product.thumbnail
    ? {
        filename: product.thumbnail.filename,
        url: product.thumbnail.original,
        file: null,
      }
    : null,
  variants:
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          id: v.id,
          price: String(v.price ?? 1),
          discount_price:
            v.discount_price != null ? String(v.discount_price) : "1",
          stock: String(v.stock ?? 1),
          weight: v.weight != null ? String(v.weight) : "",
          sku: v.sku ?? "",
          attributes: Object.entries(v.attributes ?? {}).map(
            ([key, value]) => ({
              key,
              value,
            }),
          ),
          imageFile: null,
          imageUrl: v.image?.original ?? null,
        }))
      : [emptyVariant],
  images: (product.images ?? []).map((media) => ({
    filename: media.filename,
    url: media.original,
    file: null,
  })),
  meta_title: product.meta_title ?? "",
  meta_description: product.meta_description ?? "",
  video_url: product.video_url ?? "",
});

// Handles fetching the full single-record read (list rows only carry variant
// ids, not price/stock/sku) before mounting the actual form in update mode.
const ProductForm = ({
  mode,
  productId,
  categories,
  onSuccess,
  close,
  onDirtyChange,
}: ProductFormProps) => {
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(
    mode === "create" ? emptyValues : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // if mode is update then we call this api to get the full record
  useEffect(() => {
    if (mode !== "update" || !productId) return;

    let cancelled = false;
    fetching<ProductSingleRead>({
      method: "GET",
      url: `/api/product/read/${productId}`,
      badgeLoading: "Loading product",
    }).then((payload: { data?: ProductSingleRead; detail?: string }) => {
      if (cancelled) return;
      if (!payload.data) {
        setLoadError(payload.detail ?? "Failed to load product");
        return;
      }
      setInitialValues(toDefaultValues(payload.data));
    });

    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;

  if (!initialValues) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="">
      <ProductFormBody
        mode={mode}
        productId={productId}
        categories={categories}
        defaultValues={initialValues}
        onSuccess={onSuccess}
        close={close}
        onDirtyChange={onDirtyChange}
      />
    </div>
  );
};

export default ProductForm;
