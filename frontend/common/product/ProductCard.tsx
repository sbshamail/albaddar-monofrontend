"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@deep-ecommerce/shared/components/ui/badge";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";
import { productImageAlt } from "../seo/site";
import { formatPrice, getDisplayPrice } from "./priceHelpers";

export default function ProductCard({ product }: { product: ProductRead }) {
  const router = useRouter();
  const { price, comparePrice, variant } = getDisplayPrice(product);
  const imageMedia = product.thumbnail ?? variant?.image ?? null;
  const image = imageMedia?.original ?? null;

  // Two different destinations for the same product, on purpose:
  // /product/[id]        — this Link, plain navigation, always the full page
  // /product/[id]/view   — the eye icon, a *separate* path that's the one
  //                        actually intercepted (app/@modal/(.)product/[id]/view)
  // Next.js interception is purely path-based — it can't distinguish "which
  // element triggered this nav to /product/[id]", so a single shared path
  // would catch every link to it (which is exactly what made "View full
  // details" inside the modal appear broken: it also targeted /product/[id]
  // and kept getting re-intercepted). Two paths is what makes "click the
  // card → full page" and "click the icon → quick view" both actually work.
  const openQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.id}/view`);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {comparePrice && (
          <Badge className="bg-destructive text-destructive-foreground">
            Sale
          </Badge>
        )}
        {product.is_featured && <Badge variant="secondary">Featured</Badge>}
      </div>

      <button
        type="button"
        onClick={openQuickView}
        aria-label="Quick view"
        className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background md:opacity-0 md:group-hover:opacity-100"
      >
        <Eye className="size-4" />
      </button>

      <div className="aspect-square bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={productImageAlt(product.name)}
            title={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </p>
        <div className="flex justify-between">
          <div className="mt-auto flex items-baseline gap-1.5 pt-1">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(price)}
            </span>
            {comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          <Button size="xs" type="button" onClick={openQuickView}>
            Quick view
          </Button>
        </div>
      </div>
    </Link>
  );
}
