"use client";

import { Checkbox } from "@deep-ecommerce/shared/components/ui/checkbox";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

// Deliberately root-level only, and deliberately multi-select — matches the
// reference design (a flat checkbox list of top-level categories only, no
// nested tree). Selecting several roots at once maps to a single
// deepFilters=[["category.root_id", [id, id, ...]]] call on /product/list,
// which the backend OR's together — see common/data/products.ts.
export default function CategoryFilterList({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: CategoryTreeNode[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No categories found</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((cat) => (
        <label key={cat.id} className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={selectedIds.includes(cat.id)}
            onCheckedChange={() => onToggle(cat.id)}
          />
          {cat.name}
        </label>
      ))}
    </div>
  );
}
