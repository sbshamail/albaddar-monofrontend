import { ProductRead, ProductVariantBase } from "@deep-ecommerce/shared/types/product_types";

export interface DisplayPrice {
  price: number;
  comparePrice: number | null;
  variant: ProductVariantBase | null;
}

function effectivePrice(variant: ProductVariantBase): number | null {
  if (variant.discount_price != null) return variant.discount_price;
  return variant.price;
}

/** The variant a product card/detail page should lead with — the cheapest
 * one after discount, since that's the price the card advertises. */
export function getDisplayPrice(product: ProductRead): DisplayPrice {
  const variants = product.variants ?? [];
  let best: ProductVariantBase | null = null;
  let bestPrice = Infinity;

  for (const variant of variants) {
    const price = effectivePrice(variant);
    if (price != null && price < bestPrice) {
      bestPrice = price;
      best = variant;
    }
  }

  if (!best) return { price: 0, comparePrice: null, variant: null };

  const hasDiscount = best.discount_price != null && best.discount_price < best.price;
  return {
    price: hasDiscount ? best.discount_price! : best.price,
    comparePrice: hasDiscount ? best.price : null,
    variant: best,
  };
}

export function formatPrice(value: number): string {
  return `Rs ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
