// Mirrors backend src/api/models/product_model/productModel.py and
// ProductVariantModel.py response shapes (ProductRead / ProductSingleRead).

import { MediaRead } from "./media_types";

export interface ProductShopRead {
  id: number;
  name: string;
}

export interface ProductCategoryRead {
  id: number;
  name: string;
  root_id: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// GET /product/list and /product/my-products only serialize variant ids —
// price/stock/sku are only present on the single-record read below.
export interface ProductVariantBase {
  id: number;
  price: number;
  discount_price: number | null;
  stock: number;
  is_in_stock: boolean;
  weight: number | null;
  sku: string | null;
  attributes: Record<string, string> | null;
  image: MediaRead | null;
  position: number;
}

export interface ProductVariantRead {
  id: number;
  product_id: number;
  sku: string | null;
  price: number | null;
  discount_price: number | null;
  stock: number;
  is_in_stock: boolean;
  weight: number | null;
  attributes: Record<string, string> | null;
  image: MediaRead | null;
  position: number;
  created_at: string;
  updated_at: string | null;
}

export interface ProductRead {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  whats_in_box: string | null;
  thumbnail: MediaRead | null;
  images: MediaRead[] | null;
  attributes: ProductAttribute[] | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  shop: ProductShopRead;
  category: ProductCategoryRead;
  total_stock: number;
  min_price: number | null;
  max_price: number | null;
  variants: ProductVariantBase[] | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProductSingleRead extends Omit<ProductRead, "variants"> {
  variants: ProductVariantRead[] | null;
}

// Backend's CategoryRead (category_model.py) — every field the single-record
// shape carries.
export interface CategoryRead {
  id: number;
  name: string;
  slug: string;
  level: number;
  icon: string | null;
  image: MediaRead | null;
  details: string | null;
  parent_id: number | null;
  root_id: number | null;
  admin_commission_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// GET /category/list — CategoryTreeRead is CategoryRead + children, so the
// tree already carries every field a create/edit form needs; no separate
// fetch-on-open is required the way ProductForm needs for variants.
export interface CategoryTreeNode extends CategoryRead {
  children: CategoryTreeNode[];
}
