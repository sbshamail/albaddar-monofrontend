import {
  GalleryHorizontal,
  Grid2x2,
  LayoutGrid,
  LucideIcon,
  Sparkles,
  Star,
} from "lucide-react";

import { HomeSectionType } from "@deep-ecommerce/shared/types/home_types";

export interface SectionTypeMeta {
  value: HomeSectionType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Content is a list of admin-made banners. */
  usesBanners: boolean;
  // Which settings the form shows for this type.
  fields: {
    title: boolean;
    size: boolean;
    fullWidth: boolean;
    columns: boolean;
    autoplay: boolean;
    productLimit: boolean;
    category: boolean;
  };
}

const NONE = {
  title: false,
  size: false,
  fullWidth: false,
  columns: false,
  autoplay: false,
  productLimit: false,
  category: false,
};

export const SECTION_TYPES: SectionTypeMeta[] = [
  {
    value: "hero",
    label: "Hero slider",
    description: "The classic slider built from your featured products.",
    icon: Sparkles,
    usesBanners: false,
    fields: { ...NONE, fullWidth: true, autoplay: true, productLimit: true },
  },
  {
    value: "carousel",
    label: "Banner carousel",
    description: "Your own slides — image, rich text and a click action.",
    icon: GalleryHorizontal,
    usesBanners: true,
    fields: { ...NONE, title: true, size: true, fullWidth: true, autoplay: true },
  },
  {
    value: "banner_row",
    label: "Banner row",
    description: "Banners side by side — e.g. four in a row.",
    icon: Grid2x2,
    usesBanners: true,
    fields: { ...NONE, title: true, size: true, columns: true },
  },
  {
    value: "featured_products",
    label: "Featured products",
    description: "Products you've marked as featured.",
    icon: Star,
    usesBanners: false,
    fields: { ...NONE, title: true, productLimit: true },
  },
  {
    value: "product_list",
    label: "Product list",
    description: "A browsable list, optionally limited to one category.",
    icon: LayoutGrid,
    usesBanners: false,
    fields: { ...NONE, title: true, productLimit: true, category: true },
  },
];

export const getSectionMeta = (type: HomeSectionType): SectionTypeMeta =>
  SECTION_TYPES.find((t) => t.value === type) ?? SECTION_TYPES[0];

/** Rich-text editors emit "<p></p>" for "nothing" — treat that as empty. */
export const isEmptyHtml = (html: string) =>
  html.replace(/<[^>]*>/g, "").trim() === "";
