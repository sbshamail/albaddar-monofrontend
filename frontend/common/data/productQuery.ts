import { buildListQuery } from "@deep-ecommerce/shared/api/listQuery";

export interface ProductListFilters {
  // A single category at any depth (from the mega menu / mobile category
  // modal / breadcrumbs) — resolved via /product/related-category/{id},
  // which walks the exact subtree beneath that node regardless of depth.
  categoryId?: number;
  // One or more ROOT categories (from the sidebar's flat checkbox filter) —
  // resolved via deepFilters on category.root_id. See common/product/AGENTS
  // notes in frontend/AGENTS.md for why root_id (not category_id) is what
  // makes a root checkbox match its whole subtree.
  rootCategoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  sort?: [string, "asc" | "desc"];
  page?: number;
  limit?: number;
}

// Every storefront read scopes to active products only — a direct column,
// so columnFilters (not deepFilters) is the right tool.
const ACTIVE_ONLY: [string, boolean][] = [["is_active", true]];

/**
 * Builds the backend-relative path (e.g. "/product/list?...") for a filter
 * set — shared by both the server-side fetch (products.ts, hits
 * BACKEND_API_URL directly) and the client-side fetch (products.client.ts,
 * hits the same suffix under the /api/[...slug] proxy). Kept in its own
 * pure module, with no import of shared/api/server.ts, specifically so a
 * client component importing it can never accidentally pull server-only
 * code into the browser bundle.
 */
export function buildProductListPath(filters: ProductListFilters): string {
  const { categoryId, rootCategoryIds, minPrice, maxPrice, searchTerm, sort, page, limit } =
    filters;

  const common = {
    columnFilters: ACTIVE_ONLY,
    minPrice,
    maxPrice,
    searchTerm,
    sort,
    page,
    limit: limit ?? 24,
  };

  if (categoryId) {
    return `/product/related-category/${categoryId}?${buildListQuery(common)}`;
  }

  return `/product/list?${buildListQuery({
    ...common,
    deepFilters: rootCategoryIds?.length
      ? [["category.root_id", rootCategoryIds]]
      : undefined,
  })}`;
}
