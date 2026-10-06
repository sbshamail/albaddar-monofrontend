"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { fetching } from "@deep-ecommerce/shared/api/client";
import { CategoryRead, CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

import CategoryPicker from "./CategoryPicker";
import { CategoryFormValues, categorySchema } from "./schemas/categorySchemas";

interface CategoryFormProps {
  mode: "create" | "update";
  category?: CategoryRead;
  categories: CategoryTreeNode[];
  /** Pre-fills the parent when creating a child from a specific node's "+". */
  defaultParentId?: number | null;
  onSuccess?: (category: CategoryRead) => void;
  close?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

// Unlike ProductForm, no fetch-on-open is needed — /category/list already
// returns every field the update endpoint needs, so `category` (a row the
// table already has) is enough to build defaultValues directly.
const CategoryForm = ({
  mode,
  category,
  categories,
  defaultParentId,
  onSuccess,
  close,
  onDirtyChange,
}: CategoryFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    category?.image?.original ?? null,
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      details: category?.details ?? "",
      parent_id: category?.parent_id
        ? String(category.parent_id)
        : defaultParentId
          ? String(defaultParentId)
          : "",
      icon: category?.icon ?? "",
      admin_commission_rate:
        category?.admin_commission_rate != null
          ? String(category.admin_commission_rate)
          : "",
      is_active: category?.is_active ?? true,
    },
  });

  const isDirty = form.formState.isDirty || Boolean(imageFile);
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreviewUrl(
      file ? URL.createObjectURL(file) : (category?.image?.original ?? null),
    );
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);

    // Just hand `fetching` a plain object with `isFormdata` — it converts to
    // multipart (files included) and omits undefined/null/"" fields. So a
    // top-level category sends no parent_id (not the bogus "0" it used to),
    // an empty commission is left off, and parent_id/rate go as real numbers.
    const res = await fetching<CategoryRead>({
      url:
        mode === "create"
          ? "/api/category/create"
          : `/api/category/update/${category?.id}`,
      method: mode === "create" ? "POST" : "PUT",
      isFormdata: true,
      body: {
        name: values.name,
        details: values.details,
        parent_id: values.parent_id ? Number(values.parent_id) : undefined,
        icon: values.icon,
        admin_commission_rate: values.admin_commission_rate
          ? Number(values.admin_commission_rate)
          : undefined,
        is_active: values.is_active,
        image: imageFile ?? undefined,
      },
    });

    if (!res.ok || !res.data) {
      setServerError(res.detail ?? "Something went wrong");
      return;
    }
    onSuccess?.(res.data);
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
              alt="Category image preview"
              className="h-14 w-14 rounded-md border border-border object-cover"
            />
          )}
          <div className="flex-1 space-y-1">
            <FormLabel htmlFor="category-image">Image</FormLabel>
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-2.5 file:py-1 file:text-sm"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent category</FormLabel>
              <FormControl>
                <CategoryPicker
                  categories={categories}
                  value={field.value ? Number(field.value) : null}
                  onChange={(id) => field.onChange(id ? String(id) : "")}
                  leafOnly={false}
                  placeholder="No parent (top level)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="admin_commission_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              ? "Create category"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;
