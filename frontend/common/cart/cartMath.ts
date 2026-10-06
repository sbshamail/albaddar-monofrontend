import { CartData, CartItemData } from "@/common/data/cart.client";
// Type-only — avoids a real circular runtime import with CartProvider.tsx,
// which imports these functions back.
import type { AddItemInput } from "./CartProvider";

/**
 * Pure CartData[] mutation helpers — used by CartProvider for BOTH the
 * backend-mirrored (signed-in) cart and the localStorage-held (guest) cart,
 * since both are the exact same CartData[]/CartItemData[] shape. Kept
 * side-effect-free and framework-free on purpose so either caller can apply
 * a change, then decide for itself whether to persist it to the backend,
 * to localStorage, or (optimistically) both.
 */

export function recalcTotals(cart: CartData): CartData {
  return {
    ...cart,
    total_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
  };
}

/** Add/increment a line item. Synthetic negative ids mark data that hasn't
 * round-tripped through the backend yet — for the signed-in path, refetch()
 * always replaces them with the real thing once the request settles; for
 * the guest/local path, the negative id IS the permanent id (nothing ever
 * replaces it until the item is merged into a real account cart). */
export function withOptimisticAdd(
  carts: CartData[],
  input: Required<AddItemInput>,
): CartData[] {
  const cartIndex = carts.findIndex((cart) => cart.shop_id === input.shopId);

  if (cartIndex === -1) {
    const tempCartId = -Date.now();
    const newItem: CartItemData = {
      id: tempCartId - 1,
      cart_id: tempCartId,
      product_id: null,
      product_variant_id: input.variantId,
      price: input.price,
      actual_price: input.price,
      quantity: input.quantity,
      variant_attributes: null,
      image: input.image,
      product_name: input.name,
    };
    const tempCart: CartData = {
      id: tempCartId,
      user_id: null,
      shop_id: input.shopId,
      subtotal: input.price * input.quantity,
      total_items: input.quantity,
      status: "active",
      items: [newItem],
      shop: { id: input.shopId, name: input.shopName, is_active: true },
    };
    return [...carts, tempCart];
  }

  const cart = carts[cartIndex];
  const itemIndex = cart.items.findIndex((item) => item.product_variant_id === input.variantId);
  const nextItems =
    itemIndex === -1
      ? [
          ...cart.items,
          {
            id: -Date.now(),
            cart_id: cart.id,
            product_id: null,
            product_variant_id: input.variantId,
            price: input.price,
            actual_price: input.price,
            quantity: input.quantity,
            variant_attributes: null,
            image: input.image,
            product_name: input.name,
          },
        ]
      : cart.items.map((item, i) =>
          i === itemIndex ? { ...item, quantity: item.quantity + input.quantity } : item,
        );

  return carts.map((c, i) => (i === cartIndex ? recalcTotals({ ...c, items: nextItems }) : c));
}

export function withOptimisticQuantity(
  carts: CartData[],
  itemId: number,
  quantity: number,
): CartData[] {
  return carts.map((cart) => {
    if (!cart.items.some((item) => item.id === itemId)) return cart;
    const nextItems = cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    );
    return recalcTotals({ ...cart, items: nextItems });
  });
}

export function withOptimisticRemove(carts: CartData[], itemId: number): CartData[] {
  return carts.map((cart) => {
    if (!cart.items.some((item) => item.id === itemId)) return cart;
    return recalcTotals({ ...cart, items: cart.items.filter((item) => item.id !== itemId) });
  });
}
