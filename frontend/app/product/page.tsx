import type { Metadata } from "next";

import { findCategoryById, getCategoryTree } from "@/common/data/categories";
import { ProductListFilters } from "@/common/data/productQuery";
import { getProductList } from "@/common/data/products";
import MobileFilterSheet from "@/common/product/MobileFilterSheet";
import ProductListClient from "@/common/product/ProductListClient";
import ShopFilters from "@/common/product/ShopFilters";
import SortDropdown from "@/common/product/SortDropdown";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";

const LIMIT = 24;

// "newest" (default, no `sort` param) sorts by Product.created_at.
// "price-*" sorts via a scalar subquery on the backend (see
// extract_price_sort/apply_price_sort in productRoute.py) rather than a
// join — Product.min_price/max_price aren't real columns, and a join on
// ProductVariant would duplicate any product with more than one variant.
const SORT_MAP: Record<string, [string, "asc" | "desc"]> = {
  "price-asc": ["price", "asc"],
  "price-desc": ["price", "desc"],
};

interface ProductListPageProps {
  searchParams: Promise<{
    category?: string;
    rootCategory?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
  }>;
}

const DEFAULT_DESCRIPTION =
  "Shop electric, sanitary, hardware, security cameras, clothes, grocery and more — all in one place.";

// Reflects whatever's actually being browsed (a category, a search term) in
// the tab title/search-engine result instead of a static "Shop" for every
// filter combination — `?category=` is the single-id precise-navigation
// param (see AGENTS.md), so that's the one resolved to a name here;
// `rootCategory` (the sidebar's multi-select) has no single name to show.
export async function generateMetadata({
  searchParams,
}: ProductListPageProps): Promise<Metadata> {
  const params = await searchParams;

  if (params.search) {
    return {
      title: `Search: "${params.search}"`,
      description: `Search results for "${params.search}". ${DEFAULT_DESCRIPTION}`,
    };
  }

  if (params.category) {
    const categoryId = Number(params.category);
    if (Number.isInteger(categoryId)) {
      const categories = await getCategoryTree().catch(() => []);
      const category = findCategoryById(categories, categoryId);
      if (category) {
        return {
          title: category.name,
          description: `Shop ${category.name} — ${DEFAULT_DESCRIPTION}`,
        };
      }
    }
  }

  return {
    title: "Shop",
    description: DEFAULT_DESCRIPTION,
  };
}

export default async function ProductListPage({
  searchParams,
}: ProductListPageProps) {
  const params = await searchParams;

  const filters: Omit<ProductListFilters, "page" | "limit"> = {
    categoryId: params.category ? Number(params.category) : undefined,
    rootCategoryIds: params.category
      ? params.category
          .split(",")
          .map((v) => Number(v))
          .filter((v) => Number.isInteger(v))
      : undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    searchTerm: params.search,
    sort: params.sort ? SORT_MAP[params.sort] : undefined,
  };

  const categories = await getCategoryTree().catch(() => []);

  let products: ProductRead[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await getProductList({ ...filters, page: 1, limit: LIMIT });
    products = result.data;
    total = result.total;
  } catch {
    loadError =
      "Couldn't load products right now. Try adjusting your filters or reloading.";
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <aside className="hidden w-64 shrink-0 md:block">
        <ShopFilters categories={categories} />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between gap-2">
          <MobileFilterSheet categories={categories} />
          <p className="text-sm text-muted-foreground">
            {loadError ? "" : `${total} product${total === 1 ? "" : "s"}`}
          </p>
          <SortDropdown />
        </div>

        {loadError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {loadError}
          </p>
        ) : (
          <ProductListClient
            initialProducts={products}
            initialTotal={total}
            filters={filters}
            limit={LIMIT}
          />
        )}
      </div>
    </div>
  );
}
