import { fetching } from "@deep-ecommerce/shared/api/client";
import { MediaRead } from "@deep-ecommerce/shared/types/media_types";
import { AddressDetail } from "@/common/data/address.client";

// Mirrors backend OrderItem/Order (src/api/models/order_model/*). Order has
// no aggregate status of its own — fulfillment is tracked per line item
// (OrderItemsRead.status: pending|processing|shipped|delivered|cancelled).
export interface OrderItemRead {
  id: number;
  order_id: number;
  product_id: number | null;
  shop_id: number;
  product_variant_id: number | null;
  product_name: string;
  status: string;
  variant_attributes: Record<string, string> | null;
  price: number;
  actual_price: number;
  quantity: number;
  image: MediaRead | null;
}

export interface OrderRead {
  id: number;
  user_id: number | null;
  order_number: string;
  subtotal: number;
  discount: number;
  total: number;
  shipping_address: AddressDetail | null;
  items: OrderItemRead[];
  created_at: string;
}

export async function listOrders(): Promise<OrderRead[]> {
  const res = await fetching<OrderRead[]>({
    url: "/api/order/list?limit=50",
    method: "GET",
    showLoader: false,
  });
  return res.data ?? [];
}

type CreateOrderResult =
  | { ok: true; order: OrderRead }
  | { ok: false; detail: string };

/**
 * Cart-mode checkout — requires a signed-in session (the backend derives
 * `user_id` from the bearer token itself, ignoring anything sent here; this
 * function's own `userId` param is only used to shape the request body, not
 * actually trusted server-side) and re-scopes `cart_item_ids` to that
 * user's own active carts. There is no guest cart, so this mode is never
 * used signed out. Shipping address is NOT sent here — the backend always
 * pulls the caller's default UserAddress (see address.client.ts's
 * setDefaultAddress for how the checkout form makes sure the right one is
 * flagged default first).
 */
export async function createOrderFromCart(
  userId: number,
  cartItemIds: number[],
): Promise<CreateOrderResult> {
  const res = await fetching<OrderRead>({
    url: "/api/order/create",
    method: "POST",
    body: { user_id: userId, cart_item_ids: cartItemIds, discount: 0 },
  });
  if (!res.ok || !res.data) {
    return { ok: false, detail: res.detail ?? "Couldn't place the order" };
  }
  return { ok: true, order: res.data };
}

export interface DirectOrderItem {
  product_variant_id: number;
  quantity: number;
}

/**
 * Manual order — one or more items sent inline (no Cart/CartItem row
 * involved at all), together with an inline shipping address that's used
 * exactly as sent, not replaced by any saved default. Works signed in OR
 * as a guest (no `user_id` needed either way — the backend reads it from
 * the bearer token when present and leaves the order's `user_id` null
 * otherwise). Two call shapes share this one function: "Buy Now" (a single
 * item, bypassing the cart entirely, signed in or not) and guest checkout
 * of a whole locally-held cart (multiple items, from OrderForm's
 * `cartItems`, only reachable when signed out — a signed-in cart checkout
 * goes through `createOrderFromCart` instead). Guest contact info goes on
 * `shippingAddress.email`, not as a separate param — the backend overrides
 * it with the account's real email anyway when the caller is signed in.
 */
export async function createDirectOrder(
  items: DirectOrderItem[],
  shippingAddress: AddressDetail,
): Promise<CreateOrderResult> {
  const res = await fetching<OrderRead>({
    url: "/api/order/create",
    method: "POST",
    body: { items, shipping_address: shippingAddress, discount: 0 },
  });
  if (!res.ok || !res.data) {
    return { ok: false, detail: res.detail ?? "Couldn't place the order" };
  }
  return { ok: true, order: res.data };
}
