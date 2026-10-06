import ImagesField from "@deep-ecommerce/shared/components/cui/ImagesField";
import RichTextEditor from "@deep-ecommerce/shared/components/cui/RichTextEditor";
import SortableList from "@deep-ecommerce/shared/components/cui/SortableList";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Checkbox } from "@deep-ecommerce/shared/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  CategoryTreeNode,
  ProductSingleRead,
} from "@deep-ecommerce/shared/types/product_types";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import CategoryPicker from "../CategoryPicker";
import {
  MAX_PRODUCT_IMAGES,
  ProductFormValues,
  productSchema,
} from "../schemas/productSchemas";
import AIGenerateProduct from "./AIGenerateProduct";
import { emptyVariant } from "./ProductForm";
import VariantRow from "./VariantRow";
interface ProductFormBodyProps {
  mode: "create" | "update";
  productId?: number;
  categories: CategoryTreeNode[];
  defaultValues: ProductFormValues;
  onSuccess?: (product: ProductSingleRead) => void;
  close?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const ProductFormBody = ({
  mode,
  productId,
  categories,
  defaultValues,
  onSuccess,
  close,
  onDirtyChange,
}: ProductFormBodyProps) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const isDirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("short_description", values.short_description ?? "");
    formData.set("description", values.description ?? "");
    formData.set("whats_in_box", values.whats_in_box ?? "");
    formData.set("is_active", String(values.is_active));
    formData.set("is_featured", String(values.is_featured));
    formData.set("category_id", values.category_id);
    formData.set("meta_title", values.meta_title ?? "");
    formData.set("meta_description", values.meta_description ?? "");
    formData.set("video_url", values.video_url ?? "");

    const tags = (values.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.set("tags", JSON.stringify(tags));

    // Array order IS the position — the backend derives it from index, no
    // explicit field needed here. A variant's image normally travels as a
    // separate `variant_image_{index}` file below, but when it's an
    // external URL not yet fetched (the AI/n8n import flow) there's no file
    // to attach — send it inline here instead, so the backend can download
    // it itself.
    const variantData = values.variants.map((v) => ({
      id: v.id,
      price: Number(v.price),
      discount_price: v.discount_price ? Number(v.discount_price) : null,
      stock: Number(v.stock),
      weight: v.weight ? Number(v.weight) : null,
      sku: v.sku || null,
      attributes: Object.fromEntries(v.attributes.map((a) => [a.key, a.value])),
      ...(!v.imageFile && v.imageUrl?.startsWith("http")
        ? { image: v.imageUrl }
        : {}),
    }));
    formData.set("variant_data", JSON.stringify(variantData));

    values.variants.forEach((v, index) => {
      if (v.imageFile) formData.append(`variant_image_${index}`, v.imageFile);
    });

    // file → a freshly-picked upload; url alone (no filename) → an external
    // URL not yet fetched (e.g. from the AI/n8n import flow) that the
    // backend downloads itself; filename set, nothing else → unchanged
    // existing thumbnail, so omit it entirely and leave it alone server-side.
    if (values.thumbnail?.file) {
      formData.set("thumbnail", values.thumbnail.file);
    } else if (values.thumbnail?.url && !values.thumbnail.filename) {
      formData.set("thumbnail", values.thumbnail.url);
    }

    // New files (and external URLs the AI/n8n flow suggested) go under
    // "images"; anything that was there originally but isn't in the current
    // list anymore (removed via the X button) goes under "delete_images" as
    // its filename — the backend expects repeated form fields for a
    // List[str], not a JSON string.
    values.images.forEach((image) => {
      if (image.file) {
        formData.append("images", image.file);
      } else if (image.url && !image.filename) {
        formData.append("images", image.url);
      }
    });
    const keptFilenames = new Set(
      values.images.map((image) => image.filename).filter(Boolean),
    );
    defaultValues.images.forEach((image) => {
      if (image.filename && !keptFilenames.has(image.filename)) {
        formData.append("delete_images", image.filename);
      }
    });

    const url =
      mode === "create"
        ? "/api/product/create"
        : `/api/product/update/${productId}`;
    const res = await fetch(url, { method: "POST", body: formData });
    const payload = (await res.json().catch(() => null)) as {
      data?: ProductSingleRead;
      detail?: string;
    } | null;

    if (!res.ok || !payload?.data) {
      setServerError(payload?.detail ?? "Something went wrong");
      return;
    }

    onSuccess?.(payload.data);
    close?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
        <AIGenerateProduct form={form} />

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="thumbnail">Thumbnail</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  {field.value?.url && (
                    <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={field.value.url}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        title="Remove thumbnail"
                        onClick={() => field.onChange(null)}
                        className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      field.onChange(
                        file
                          ? {
                              filename: null,
                              url: URL.createObjectURL(file),
                              file,
                            }
                          : null,
                      );
                    }}
                    className="block flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-2.5 file:py-1 file:text-sm"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ImagesField form={form} name="images" maxImages={MAX_PRODUCT_IMAGES} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Short description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Product description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whats_in_box"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What&apos;s in the box</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="e.g. 1x Phone, 1x Charger, 1x User manual"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategoryPicker
                  categories={categories}
                  value={field.value ? Number(field.value) : null}
                  onChange={(id) => field.onChange(id ? String(id) : "")}
                  leafOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Variants</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ ...emptyVariant, attributes: [] })}
            >
              + Add variant
            </Button>
          </div>

          <SortableList
            items={fields}
            onReorder={move}
            className="space-y-3"
            renderItem={(field, index, dragHandleProps) => (
              <VariantRow
                key={field.id}
                form={form}
                index={index}
                dragHandleProps={dragHandleProps}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            )}
          />
          {form.formState.errors.variants?.root?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="YouTube or Vimeo link (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="comma, separated, tags" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-6">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Active</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Featured</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta title</FormLabel>
              <FormControl>
                <Input placeholder="Optional (SEO)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta description</FormLabel>
              <FormControl>
                <Input placeholder="Optional (SEO)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};
