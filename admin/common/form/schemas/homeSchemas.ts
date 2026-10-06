import { z } from "zod";

const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max),
      { message: `${label}: whole number ${min}–${max}` },
    );

export const sectionSchema = z.object({
  type: z.string().min(1, "Choose a section type"),
  title: z.string().max(191),
  width: optionalInt("Width", 1, 4000),
  height: optionalInt("Height", 1, 4000),
  columns: optionalInt("Columns", 1, 6),
  product_limit: optionalInt("Limit", 1, 48),
  category_id: z.string(),
  full_width: z.boolean(),
  autoplay: z.boolean(),
  is_active: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

export const bannerSchema = z.object({
  title: z.string().max(191),
  content: z.string(),
  background: z.string(),
  link_url: z
    .string()
    .max(500)
    .refine((v) => v === "" || /^(\/(?!\/)|https?:\/\/)/i.test(v.trim()), {
      message: "Start with / (internal page) or https://",
    }),
  open_in_new_tab: z.boolean(),
  is_active: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
