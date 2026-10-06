import { ProductRead } from "@deep-ecommerce/shared/types/product_types";
import ProductGrid from "@/common/product/ProductGrid";

export default function FeaturedProducts({
  products,
  loadError,
  title = "Exclusive Products",
}: {
  products: ProductRead[];
  loadError: string | null;
  title?: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <ProductGrid products={products} emptyState="No featured products yet" />
      )}
    </section>
  );
}
