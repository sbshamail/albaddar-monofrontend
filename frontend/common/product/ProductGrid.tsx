import { ProductRead } from "@deep-ecommerce/shared/types/product_types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  emptyState,
}: {
  products: ProductRead[];
  emptyState?: React.ReactNode;
}) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        {emptyState ?? "No products found"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
