"use client";

import { useCallback, useState } from "react";

import { CardSkeleton } from "@deep-ecommerce/shared/components/cui/loader";
import { InfiniteScroll } from "@deep-ecommerce/shared/components/cui/InfiniteScroll";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";
import { fetchProductListClient } from "@/common/data/products.client";
import { ProductListFilters } from "@/common/data/productQuery";
import ProductGrid from "./ProductGrid";

export default function ProductListClient({
  initialProducts,
  initialTotal,
  filters,
  limit,
}: {
  initialProducts: ProductRead[];
  initialTotal: number;
  filters: Omit<ProductListFilters, "page" | "limit">;
  limit: number;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // New search params → the server re-ran page.tsx and handed us a fresh
  // first page, not "more of the old list". initialProducts is a new array
  // reference every time that happens, so resetting on that change (during
  // render, not an effect) is exactly the "sync prop → state" pattern this
  // codebase already uses elsewhere.
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
  if (initialProducts !== prevInitialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
    setTotal(initialTotal);
    setPage(1);
  }

  const hasMore = products.length < total;

  const loadMore = useCallback(async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const result = await fetchProductListClient({ ...filters, page: nextPage, limit });
      setProducts((prev) => [...prev, ...result.data]);
      setTotal(result.total);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page]);

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loading={loading}
      onLoadMore={loadMore}
      loadingIndicator={
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      }
      endMessage={products.length > 0 ? "You've reached the end — no more products to show" : null}
    >
      <ProductGrid products={products} emptyState="No products match your filters" />
    </InfiniteScroll>
  );
}
