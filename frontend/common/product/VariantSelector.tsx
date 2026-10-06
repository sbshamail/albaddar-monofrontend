"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "@/common/cart/CartProvider";
import { buildWhatsAppOrderLink } from "@/common/whatsapp/whatsapp";
import WhatsAppIcon from "@/common/whatsapp/WhatsAppIcon";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { MediaRead } from "@deep-ecommerce/shared/types/media_types";
import { ProductVariantRead } from "@deep-ecommerce/shared/types/product_types";
import { formatPrice } from "./priceHelpers";

// Attribute keys that get rendered as color swatches instead of text pills.
// The value itself is passed straight through to CSS `background-color` —
// it works whether the shop admin set it to a plain name ("red", "blue") or
// a hex/rgb string ("#ff0000", "rgb(255,0,0)"); CSS accepts all three
// natively, so there's no name→hex lookup table to maintain here.
const COLOR_KEYS = ["color", "colour"];

export default function VariantSelector({
  productId,
  shopId,
  shopName,
  productName,
  fallbackImage,
  variants,
}: {
  productId: number;
  shopId: number;
  shopName: string;
  productName: string;
  fallbackImage: MediaRead | null;
  variants: ProductVariantRead[];
}) {
  const router = useRouter();
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) =>
      Object.keys(v.attributes ?? {}).forEach((k) => keys.add(k)),
    );
    return Array.from(keys);
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const optionsFor = (key: string) => {
    const values = new Set<string>();
    variants.forEach((v) => {
      const val = v.attributes?.[key];
      if (val) values.add(val);
    });
    return Array.from(values);
  };

  const matchedVariant = useMemo(() => {
    if (attributeKeys.length === 0) return variants[0] ?? null;
    if (attributeKeys.some((key) => !selected[key])) return null;
    return (
      variants.find((v) =>
        attributeKeys.every((key) => v.attributes?.[key] === selected[key]),
      ) ?? null
    );
  }, [attributeKeys, selected, variants]);

  const price =
    matchedVariant != null
      ? (matchedVariant.discount_price ?? matchedVariant.price ?? 0)
      : null;
  const comparePrice =
    matchedVariant?.discount_price != null &&
    matchedVariant.price != null &&
    matchedVariant.discount_price < matchedVariant.price
      ? matchedVariant.price
      : null;

  const addToCart = async () => {
    if (!matchedVariant || price == null) return;
    setAdding(true);
    setError(null);
    const result = await addItem({
      shopId,
      shopName,
      variantId: matchedVariant.id,
      quantity,
      name: productName,
      image: matchedVariant.image ?? fallbackImage,
      price,
    });
    setAdding(false);
    if (!result.ok && result.detail !== "Sign in required") {
      setError(result.detail ?? "Couldn't add to cart");
    }
  };

  // "Buy Now" skips the cart entirely — it's a direct/manual order, not
  // add-to-cart-then-checkout. Nothing async happens here at all; the
  // variant id, quantity, and just enough display info travel to the
  // checkout page via the URL, which builds the manual order/create call
  // itself (see common/order/OrderForm.tsx and order.client.ts). Display
  // values in the URL are never trusted for the actual charge — the
  // backend always recomputes price/stock from the variant id server-side.
  const buyNow = () => {
    if (!matchedVariant || price == null) return;
    const image = matchedVariant.image?.original ?? fallbackImage?.original;
    const params = new URLSearchParams({
      variantId: String(matchedVariant.id),
      quantity: String(quantity),
      name: productName,
      price: String(price),
    });
    if (image) params.set("image", image);
    router.push(`/checkout?${params.toString()}`);
  };

  // Order via WhatsApp — no address form, no account required, the shop
  // takes it from there once the chat starts. window.location.origin (not
  // an env var) so the link is always correct for whatever domain this is
  // actually running on.
  const orderOnWhatsApp = () => {
    if (!matchedVariant || price == null) return;
    const url = buildWhatsAppOrderLink({
      productName,
      price,
      quantity,
      variantAttributes: matchedVariant.attributes,
      productUrl: `${window.location.origin}/product/${productId}`,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-4">
      {price != null && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(price)}
          </span>
          {comparePrice != null && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      )}

      {attributeKeys.map((key) => {
        const isColor = COLOR_KEYS.includes(key.toLowerCase());
        return (
          <div key={key}>
            <p className="mb-1.5 text-sm font-medium capitalize text-foreground">
              {key}
            </p>
            <div className="flex flex-wrap gap-2">
              {optionsFor(key).map((value) =>
                isColor ? (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                    aria-label={value}
                    title={value}
                    className={cn(
                      "size-8 rounded-full border-2 shadow-sm",
                      selected[key] === value
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border",
                    )}
                    style={{ backgroundColor: value }}
                  />
                ) : (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm",
                      selected[key] === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {value}
                  </button>
                ),
              )}
            </div>
          </div>
        );
      })}

      {matchedVariant && (
        <p className="text-sm  bg-muted w-full p-4 rounded-2xl border border-primary/30 text-primary">
          {matchedVariant.is_in_stock ? `In Stock` : "Out of stock"}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Number(e.target.value) || 1))
            }
            className="h-10 w-20"
            aria-label="Quantity"
          />
          <Button
            variant="outline"
            className="flex-1"
            disabled={!matchedVariant || !matchedVariant.is_in_stock || adding}
            onClick={addToCart}
          >
            {!matchedVariant
              ? "Select options"
              : !matchedVariant.is_in_stock
                ? "Out of stock"
                : adding
                  ? "Adding…"
                  : "Add to Cart"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="flex-1"
            disabled={!matchedVariant || !matchedVariant.is_in_stock || adding}
            onClick={buyNow}
          >
            Buy Now
          </Button>
          <Button
            className="flex-1 gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe5b] focus-visible:ring-[#25D366]/40"
            disabled={!matchedVariant || !matchedVariant.is_in_stock || adding}
            onClick={orderOnWhatsApp}
          >
            <WhatsAppIcon className="size-4" />
            Order on WhatsApp
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
