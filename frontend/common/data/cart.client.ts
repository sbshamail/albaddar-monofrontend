import { fetching } from "@deep-ecommerce/shared/api/client";
import { MediaRead } from "@deep-ecommerce/shared/types/media_types";

// Mirrors backend CartShopRead / CartItemRead (src/api/models/cart_model/*).
// Cart is keyed per (user, shop, status) — one customer can have several
// active carts, one per shop they've bought from (marketplace model) — so
// the cart page/badge always works over a LIST of carts, never a single one.

export interface CartItemData {
  id: number;
  cart_id: number;
  product_id: number | null;
  product_variant_id: number | null;
  price: number | null;
  actual_price: number | null;
  quantity: number;
  variant_attributes: Record<string, string> | null;
  image: MediaRead | null;
  product_name: string | null;
}

export interface CartData {
  id: number;
  user_id: number | null;
  shop_id: number | null;
  subtotal: number;
  total_items: number;
  status: string;
  items: CartItemData[];
  shop: { id: number; name: string; is_active: boolean } | null;
}

export interface CartMutationResult {
  ok: boolean;
  detail?: string;
  /** The updated cart, when the backend returns one (only add-item does) —
   * lets a caller find the real backend id of the item it just added
   * without waiting for a separate refetch (used by "Buy Now"). */
  cart?: CartData;
}

export async function listCarts(): Promise<CartData[]> {
  const res = await fetching<CartData[]>({
    url: "/api/cart/list?limit=100",
    method: "GET",
    showLoader: false,
  });
  return res.data ?? [];
}

/**
 * Adding an item is find-or-create on the backend: POST /cart/create takes
 * the whole desired item set for (shop, and upserts/increments quantity for
 * any variant already in that shop's cart — there's no separate "add one
 * item" endpoint. Form-encoded, not JSON (CartForm on the backend), and
 * `items` is itself a JSON-encoded string field, not a nested JSON body.
 * `badgeLoading` drives the shared small "Updating cart…" badge
 * (shared/providers/LoaderContext.tsx) — CartProvider applies the actual
 * cart change optimistically before this even resolves, so this badge is
 * background-sync feedback, not the primary "is it working" signal.
 */
export async function addCartItem(
  shopId: number,
  variantId: number,
  quantity: number,
): Promise<CartMutationResult> {
  const res = await fetching<CartData>({
    url: "/api/cart/create",
    method: "POST",
    isFormdata: true,
    badgeLoading: "Updating cart",
    body: {
      shop_id: shopId,
      items: JSON.stringify([{ product_variant_id: variantId, quantity }]),
    },
  });
  return { ok: res.ok, detail: res.detail, cart: res.data };
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number,
): Promise<CartMutationResult> {
  const res = await fetching({
    url: `/api/cart-item/update/${itemId}`,
    method: "PUT",
    isFormdata: true,
    badgeLoading: "Updating cart",
    body: { quantity },
  });
  return { ok: res.ok, detail: res.detail as string | undefined };
}

export async function removeCartItem(itemId: number): Promise<CartMutationResult> {
  const res = await fetching({
    url: `/api/cart-item/delete/${itemId}`,
    method: "DELETE",
    badgeLoading: "Updating cart",
  });
  return { ok: res.ok, detail: res.detail as string | undefined };
}
