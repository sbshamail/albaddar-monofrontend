"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

import { MediaRead } from "@deep-ecommerce/shared/types/media_types";
import { useAuth } from "@/providers/auth/authContext";
import {
  addCartItem,
  CartData,
  CartMutationResult,
  listCarts,
  removeCartItem,
  updateCartItemQuantity,
} from "@/common/data/cart.client";
import { withOptimisticAdd, withOptimisticQuantity, withOptimisticRemove } from "./cartMath";
import { clearLocalCart, readLocalCart, writeLocalCart } from "./localCart";

export interface AddItemInput {
  shopId: number;
  shopName: string;
  variantId: number;
  quantity?: number;
  name: string;
  image: MediaRead | null;
  price: number;
}

interface CartContextValue {
  carts: CartData[];
  loading: boolean;
  /** Works signed in or as a guest — a guest's change is applied to a
   * localStorage-held cart with the exact same shape as the real one, no
   * sign-in prompt. Applies the change locally right away (optimistic) in
   * both cases; the signed-in path's backend call happens in the
   * background and reverts the local change on failure. */
  addItem: (input: AddItemInput) => Promise<CartMutationResult>;
  removeItem: (itemId: number) => Promise<CartMutationResult>;
  updateQuantity: (itemId: number, quantity: number) => Promise<CartMutationResult>;
  refresh: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

// External store. Signed in: a server mirror — each mutation applies
// optimistically to `state.carts`, fires the real request in the
// background, and on failure reverts + refetches to resync with whatever
// the database's actual stock/quantity truth turns out to be. Signed out:
// `state.carts` IS the source of truth (backed by localStorage, see
// localCart.ts) — there is no backend call to revert to, so a guest
// mutation just applies and persists, full stop.
interface CartStoreState {
  carts: CartData[];
  loading: boolean;
}

let state: CartStoreState = { carts: [], loading: false };
const SERVER_STATE: CartStoreState = { carts: [], loading: false };
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function getSnapshot(): CartStoreState {
  return state;
}
function getServerSnapshot(): CartStoreState {
  return SERVER_STATE;
}

function setCarts(carts: CartData[]): void {
  state = { ...state, carts };
  notify();
}

async function refetch(): Promise<void> {
  state = { ...state, loading: true };
  notify();
  try {
    state = { carts: await listCarts(), loading: false };
  } catch {
    state = { carts: [], loading: false };
  }
  notify();
}

/** Signed-out: just load whatever's in localStorage — no network. */
function loadLocalCart(): void {
  state = { carts: readLocalCart(), loading: false };
  notify();
}

/**
 * Fires once on the transition into "signed in" (including a page load
 * that's already authenticated, which is harmless to re-run — see below).
 * Any items the guest built up locally get pushed into the account's real
 * cart, EXCEPT ones already present there (same shop + same variant): per
 * spec, the signed-in cart's own item always wins on a conflict, the local
 * duplicate is simply dropped rather than merged/summed — avoids double
 * counting toward stock on an item the account may have added from another
 * device already. Idempotent: an empty local cart (the common case — most
 * sign-ins don't follow guest cart activity) makes this a plain refetch.
 */
async function mergeLocalCartIntoAccount(): Promise<void> {
  const localCarts = readLocalCart();
  await refetch();

  if (localCarts.length === 0) return;

  for (const localCart of localCarts) {
    const backendCart = state.carts.find((cart) => cart.shop_id === localCart.shop_id);
    for (const item of localCart.items) {
      const alreadyPresent = backendCart?.items.some(
        (existing) => existing.product_variant_id === item.product_variant_id,
      );
      if (alreadyPresent || item.product_variant_id == null) continue;
      await addCartItem(localCart.shop_id!, item.product_variant_id, item.quantity);
    }
  }

  clearLocalCart();
  await refetch();
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Genuine external-system sync (backend fetch, or reading localStorage),
  // not derived state — re-runs whenever sign-in state changes.
  useEffect(() => {
    if (isAuthenticated) mergeLocalCartIntoAccount();
    else loadLocalCart();
  }, [isAuthenticated]);

  const addItem: CartContextValue["addItem"] = useCallback(
    async (input) => {
      const quantity = input.quantity ?? 1;
      const full: Required<AddItemInput> = { ...input, quantity };

      if (!isAuthenticated) {
        const next = withOptimisticAdd(state.carts, full);
        setCarts(next);
        writeLocalCart(next);
        return { ok: true };
      }

      const previousCarts = state.carts;
      setCarts(withOptimisticAdd(state.carts, full));

      const result = await addCartItem(input.shopId, input.variantId, quantity);
      if (!result.ok) {
        // Revert to the last known-good state, then resync — stock or
        // pricing may have changed server-side since we last fetched.
        setCarts(previousCarts);
        await refetch();
        return { ok: false, detail: result.detail ?? "Couldn't add to cart. Please try again." };
      }

      await refetch();
      return { ok: true, cart: result.cart };
    },
    [isAuthenticated],
  );

  const removeItem: CartContextValue["removeItem"] = useCallback(
    async (itemId) => {
      if (!isAuthenticated) {
        const next = withOptimisticRemove(state.carts, itemId);
        setCarts(next);
        writeLocalCart(next);
        return { ok: true };
      }

      const previousCarts = state.carts;
      setCarts(withOptimisticRemove(state.carts, itemId));

      const result = await removeCartItem(itemId);
      if (!result.ok) {
        setCarts(previousCarts);
        await refetch();
        return { ok: false, detail: result.detail ?? "Couldn't remove item. Please try again." };
      }
      await refetch();
      return { ok: true };
    },
    [isAuthenticated],
  );

  const updateQuantity: CartContextValue["updateQuantity"] = useCallback(
    async (itemId, quantity) => {
      if (quantity <= 0) return removeItem(itemId);

      if (!isAuthenticated) {
        const next = withOptimisticQuantity(state.carts, itemId, quantity);
        setCarts(next);
        writeLocalCart(next);
        return { ok: true };
      }

      const previousCarts = state.carts;
      setCarts(withOptimisticQuantity(state.carts, itemId, quantity));

      const result = await updateCartItemQuantity(itemId, quantity);
      if (!result.ok) {
        setCarts(previousCarts);
        await refetch();
        return {
          ok: false,
          detail: result.detail ?? "Couldn't update quantity — check stock and try again.",
        };
      }
      await refetch();
      return { ok: true };
    },
    [isAuthenticated, removeItem],
  );

  const allItems = snapshot.carts.flatMap((cart) => cart.items);
  const totalItems = allItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = allItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        carts: snapshot.carts,
        loading: snapshot.loading,
        addItem,
        removeItem,
        updateQuantity,
        refresh: isAuthenticated ? refetch : async () => loadLocalCart(),
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
