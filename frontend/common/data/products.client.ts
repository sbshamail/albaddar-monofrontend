import { fetching } from "@deep-ecommerce/shared/api/client";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";
import { buildProductListPath, ProductListFilters } from "./productQuery";

/**
 * Browser-side equivalent of getProductList() (products.ts) — goes through
 * the /api/[...slug] proxy instead of BACKEND_API_URL directly, since a
 * client component can't reach the backend origin. Used for infinite-scroll
 * "load more" calls after the first page, which is server-rendered.
 */
export async function fetchProductListClient(
  filters: ProductListFilters,
): Promise<{ data: ProductRead[]; total: number }> {
  const res = await fetching<ProductRead[]>({
    url: `/api${buildProductListPath(filters)}`,
    method: "GET",
    // Scroll-triggered loads shouldn't blank the screen with the global
    // spinner — the grid's own trailing skeleton row is the loading state.
    showLoader: false,
  });

  return {
    data: res.data ?? [],
    total: typeof res.total === "number" ? res.total : 0,
  };
}
