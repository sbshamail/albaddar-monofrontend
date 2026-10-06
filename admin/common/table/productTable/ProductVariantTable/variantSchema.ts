import { z } from "zod";

import {
  numericString,
  optionalNumericString,
  variantAttributeSchema,
} from "@/common/form/schemas/productSchemas";

// Standalone single-variant form (create/update against
// /product-variant/create|update — distinct from ProductForm's bulk
// variant_data flow, which posts every variant as one JSON array).
export const variantFormSchema = z.object({
  price: numericString("Price must be 0 or more"),
  discount_price: optionalNumericString("Discount price must be 0 or more"),
  stock: numericString("Stock must be 0 or more"),
  sku: z.string().optional(),
  attributes: z.array(variantAttributeSchema),
  imageFile: z.instanceof(File).nullable(),
  imageUrl: z.string().nullable(),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;
