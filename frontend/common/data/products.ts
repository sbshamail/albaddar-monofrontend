import { buildListQuery } from "@deep-ecommerce/shared/api/listQuery";
import {
  ApiError,
  backendFetch,
  fetchList,
} from "@deep-ecommerce/shared/api/server";
import {
  ProductRead,
  ProductSingleRead,
} from "@deep-ecommerce/shared/types/product_types";
import { buildProductListPath, ProductListFilters } from "./productQuery";

export type { ProductListFilters };

export async function getProductList(
  filters: ProductListFilters,
): Promise<{ data: ProductRead[]; total: number }> {
  return fetchList<ProductRead>(buildProductListPath(filters));
}

export async function getFeaturedProducts(limit = 8): Promise<ProductRead[]> {
  const query = buildListQuery({
    deepFilters: [
      ["is_active", true],
      ["is_featured", true],
    ],
    limit,
  });
  const { data } = await fetchList<ProductRead>(`/product/list?${query}`);

  return data;
}

export async function getProduct(
  id: number,
): Promise<ProductSingleRead | null> {
  try {
    // Next caches Server Component fetches by default — with no explicit
    // cache option, a single 404 (product briefly missing/inactive, a
    // backend blip during testing) gets cached and served indefinitely
    // regardless of later code or data changes. Stock/price/availability
    // are exactly the kind of thing that shouldn't be stale anyway.
    return await backendFetch<ProductSingleRead>(`/product/read/${id}`, {
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getRelatedProducts(
  categoryId: number,
  excludeProductId: number,
  limit = 8,
): Promise<ProductRead[]> {
  const query = buildListQuery({
    columnFilters: [["is_active", true]],
    limit: limit + 1,
  });
  const { data } = await fetchList<ProductRead>(
    `/product/related-category/${categoryId}?${query}`,
  );
  return data.filter((p) => p.id !== excludeProductId).slice(0, limit);
}
