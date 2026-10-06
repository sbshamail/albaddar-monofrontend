"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { Slider } from "@deep-ecommerce/shared/components/ui/slider";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";
import CategoryFilterList from "./CategoryFilterList";
import { useFilterNavigation } from "./useFilterNavigation";

// No endpoint reports a real max product price, so this is a reasonable
// static ceiling for the slider rather than a derived value.
const PRICE_CEILING = 10000;

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v));
}

export default function ShopFilters({
  categories,
  onApplied,
}: {
  categories: CategoryTreeNode[];
  onApplied?: () => void;
}) {
  const { navigate, isPending } = useFilterNavigation();
  const searchParams = useSearchParams();

  const [rootCategoryIds, setRootCategoryIds] = useState<number[]>(
    parseIds(searchParams.get("category")),
  );
  const [range, setRange] = useState<[number, number]>([
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0,
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : PRICE_CEILING,
  ]);

  const toggleCategory = (id: number) => {
    setRootCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id],
    );
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams);
    // A precise single-category navigation (from the mega menu / mobile
    // category modal) and this sidebar's root-category multi-select are two
    // different filters — applying one clears the other rather than
    // silently combining into a confusing intersection.
    params.delete("category");
    if (rootCategoryIds.length)
      params.set("category", rootCategoryIds.join(","));
    else params.delete("category");
    if (range[0] > 0) params.set("minPrice", String(range[0]));
    else params.delete("minPrice");
    if (range[1] < PRICE_CEILING) params.set("maxPrice", String(range[1]));
    else params.delete("maxPrice");
    params.delete("page");
    navigate(`/product?${params.toString()}`);
    onApplied?.();
  };

  const clear = () => {
    setRootCategoryIds([]);
    setRange([0, PRICE_CEILING]);
    navigate("/product");
    onApplied?.();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={clear} disabled={isPending}>
          Clear Filter
        </Button>
        <Button size="sm" onClick={apply} disabled={isPending}>
          {isPending ? "Applying…" : "Apply"}
        </Button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price</h3>
        <div className="mb-3 flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={range[1]}
            value={range[0]}
            onChange={(e) => setRange([Number(e.target.value) || 0, range[1]])}
            className="h-8"
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            min={range[0]}
            max={PRICE_CEILING}
            value={range[1]}
            onChange={(e) =>
              setRange([range[0], Number(e.target.value) || PRICE_CEILING])
            }
            className="h-8"
            aria-label="Maximum price"
          />
        </div>
        <Slider
          min={0}
          max={PRICE_CEILING}
          step={50}
          value={range}
          onValueChange={(value) => setRange([value[0], value[1]])}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
        <CategoryFilterList
          categories={categories}
          selectedIds={rootCategoryIds}
          onToggle={toggleCategory}
        />
      </div>
    </div>
  );
}
