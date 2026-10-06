"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AttributesField from "@deep-ecommerce/shared/components/cui/AttributesField";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { ProductVariantBase } from "@deep-ecommerce/shared/types/product_types";

import { VariantFormValues, variantFormSchema } from "./variantSchema";

interface VariantFormProps {
  mode: "create" | "update";
  productId: number;
  variant?: ProductVariantBase;
  /** Where a newly-created variant lands in the list — pass the current
   * variant count so it's appended at the end. Ignored in update mode. */
  nextPosition?: number;
  onSuccess: (variant: ProductVariantBase) => void;
  close?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const toDefaultValues = (variant?: ProductVariantBase): VariantFormValues => ({
  price: variant ? String(variant.price ?? 0) : "0",
  discount_price:
    variant?.discount_price != null ? String(variant.discount_price) : "",
  stock: variant ? String(variant.stock ?? 0) : "1",
  sku: variant?.sku ?? "",
  attributes: Object.entries(variant?.attributes ?? {}).map(([key, value]) => ({
    key,
    value,
  })),
  imageFile: null,
  imageUrl: variant?.image?.original ?? null,
});

const VariantForm = ({
  mode,
  productId,
  variant,
  nextPosition,
  onSuccess,
  close,
  onDirtyChange,
}: VariantFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    variant?.image?.original ?? null,
  );

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: toDefaultValues(variant),
  });

  const isDirty = form.formState.isDirty || Boolean(imageFile);
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreviewUrl(
      file ? URL.createObjectURL(file) : (variant?.image?.original ?? null),
    );
  };

  const onSubmit = async (values: VariantFormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.set("price", values.price);
    formData.set(
      "discount_price",
      values.discount_price ? values.discount_price : "",
    );
    formData.set("stock", values.stock);
    formData.set("sku", values.sku ?? "");
    formData.set(
      "attributes",
      JSON.stringify(
        Object.fromEntries(values.attributes.map((a) => [a.key, a.value])),
      ),
    );
    if (imageFile) formData.set("image", imageFile);
    if (mode === "create") formData.set("position", String(nextPosition ?? 0));

    const url =
      mode === "create"
        ? `/api/product-variant/create/${productId}`
        : `/api/product-variant/update/${variant?.id}`;
    const res = await fetch(url, { method: "POST", body: formData });
    const payload = (await res.json().catch(() => null)) as {
      data?: ProductVariantBase;
      detail?: string;
    } | null;

    if (!res.ok || !payload?.data) {
      setServerError(payload?.detail ?? "Something went wrong");
      return;
    }

    onSuccess(payload.data);
    close?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-3">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Variant preview"
              className="h-14 w-14 rounded-md border border-border object-cover"
            />
          )}
          <div className="flex-1 space-y-1">
            <FormLabel htmlFor="variant-image">Image</FormLabel>
            <input
              id="variant-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-2.5 file:py-1 file:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min={0}
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AttributesField form={form} name="attributes" />

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Adding…"
              : "Saving…"
            : mode === "create"
              ? "Add variant"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};

export default VariantForm;
