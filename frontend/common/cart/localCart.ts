import { CartData } from "@/common/data/cart.client";

// Guest (signed-out) cart — held entirely client-side, same CartData[] shape
// the backend-mirrored cart uses (see cartMath.ts), so CartProvider can
// apply the exact same add/update/remove math to either one. Never touches
// the backend; only ever merged into a real account cart on sign-in (see
// CartProvider's mergeLocalCartIntoAccount).
const STORAGE_KEY = "albaddar_guest_cart";

export function readLocalCart(): CartData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt/foreign JSON, private-browsing storage denial, etc. — a
    // guest cart is not worth crashing the page over.
    return [];
  }
}

export function writeLocalCart(carts: CartData[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  } catch {
    // Quota exceeded, storage disabled, etc. — the in-memory store (this
    // tab's React state) still has the change; it just won't survive a
    // reload. Not worth surfacing an error for a cart add.
  }
}

export function clearLocalCart(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See writeLocalCart.
  }
}
