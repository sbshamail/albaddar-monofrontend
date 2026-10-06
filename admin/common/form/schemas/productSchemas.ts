import { z } from "zod";

export const numericString = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message,
    });

export const optionalNumericString = (message: string) =>
  z
    .string()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message,
    })
    .optional();

export const variantAttributeSchema = z.object({
  key: z.string().min(1, "Pick or enter an attribute name"),
  value: z.string().min(1, "Value is required"),
});

export const productVariantSchema = z
  .object({
    // Present when editing an existing variant; absent on a newly-added row.
    id: z.number().optional(),
    price: numericString("Price must be 0 or more"),
    discount_price: optionalNumericString("Discount price must be 0 or more"),
    stock: numericString("Stock must be 0 or more"),
    weight: optionalNumericString("Weight must be 0 or more"),
    sku: z.string().optional(),
    attributes: z.array(variantAttributeSchema),
    // Client-only — a new file to upload, and/or the existing image's preview
    // URL. Neither is sent as JSON; onSubmit reads imageFile directly.
    imageFile: z.instanceof(File).nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  })
  .refine(
    (v) => !v.discount_price || Number(v.discount_price) < Number(v.price),
    {
      message: "Discount price must be less than price",
      path: ["discount_price"],
    },
  );

export const MAX_PRODUCT_IMAGES = 5;

// One image slot — either an existing server-side image (filename/url set,
// file null) or a newly-picked file not uploaded yet (file set, filename
// null). id is a client-only key so SortableList/useFieldArray can reorder
// without it (RHF's own field.id already does that, this is just for
// building the delete_images list on submit).
export const productImageSchema = z.object({
  filename: z.string().nullable(),
  url: z.string().nullable(),
  file: z.instanceof(File).nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  short_description: z
    .string()
    .max(1000, "Keep it under 300 characters")
    .optional(),
  description: z.string().optional(),
  whats_in_box: z.string().optional(),
  category_id: z.string().min(1, "Select a category"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  tags: z.string().optional(),
  variants: z.array(productVariantSchema).min(1, "Add at least one variant"),
  // Same {filename, url, file} shape as an images[] entry (see
  // productImageSchema) — filename+url set for an existing/already-stored
  // thumbnail, file set for a freshly-picked one, or url alone holding a
  // not-yet-downloaded external URL (e.g. from the AI/n8n import flow).
  thumbnail: productImageSchema.nullable(),
  images: z
    .array(productImageSchema)
    .max(MAX_PRODUCT_IMAGES, `Up to ${MAX_PRODUCT_IMAGES} images allowed`),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  video_url: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), {
      message: "Enter a valid URL (must start with http:// or https://)",
    }),
});

export type ProductVariantFormValue = z.infer<typeof productVariantSchema>;
export type ProductImageFormValue = z.infer<typeof productImageSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
