"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/common/cart/CartProvider";
import {
  AddressDetail,
  createAddress,
  listAddresses,
  setDefaultAddress,
  UserAddress,
} from "@/common/data/address.client";
import {
  createDirectOrder,
  createOrderFromCart,
  OrderRead,
} from "@/common/data/order.client";
import { formatPrice } from "@/common/product/priceHelpers";
import { useAuth } from "@/providers/auth/authContext";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import AddressSelector from "./AddressSelector";

const EMPTY_DRAFT: AddressDetail = {
  details: "",
  city: "",
  region: "",
  postal_code: "",
  // AddressForm's "Country" field is a disabled, display-only input fixed
  // to "Pakistan" (single-country business) — it never fires onChange, so
  // the real value has to be set here instead of relying on the form to
  // write it in.
  country: "Pakistan",
  person_name: "",
  phone: "",
};

export default function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { carts, removeItem, refresh: refreshCart } = useCart();

  // Three order paths, all ending at the same backend endpoint:
  // - "direct" (Buy Now): one item, sent inline with the shipping address —
  //   never touches a cart, signed in or not.
  // - "cart", signed in: selected item ids from the account's real backend
  //   cart, checked out via cart_item_ids (address comes from the account's
  //   saved default).
  // - "cart", signed out: selected item ids from the guest's localStorage
  //   cart (see CartProvider) — there's no backend cart to reference, so
  //   this goes through the same inline-items+address request "direct"
  //   uses, just with more than one item.
  const directVariantId = searchParams.get("variantId");
  const mode: "direct" | "cart" = directVariantId ? "direct" : "cart";

  const directItem =
    mode === "direct"
      ? {
          variantId: Number(directVariantId),
          quantity: Math.max(1, Number(searchParams.get("quantity")) || 1),
          name: searchParams.get("name") ?? "Item",
          price: Number(searchParams.get("price")) || 0,
          image: searchParams.get("image"),
        }
      : null;

  const selectedCartItemIds = new Set(
    (searchParams.get("items") ?? "")
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id)),
  );
  const cartItems = carts
    .flatMap((cart) => cart.items)
    .filter((item) => selectedCartItemIds.has(item.id));

  const subtotal =
    mode === "direct"
      ? directItem!.price * directItem!.quantity
      : cartItems.reduce(
          (sum, item) => sum + (item.price ?? 0) * item.quantity,
          0,
        );

  // A guest has no saved addresses at all — starts resolved to an empty
  // list; a signed-in user starts at `null` ("loading") until the effect
  // below fetches theirs.
  const [addresses, setAddresses] = useState<UserAddress[] | null>(
    isAuthenticated ? null : [],
  );
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">(
    "new",
  );
  const [draft, setDraft] = useState<AddressDetail>(EMPTY_DRAFT);
  // Guest-only contact info (see createDirectOrder) — a signed-in order
  // uses the account's own email instead, so this never renders for one.
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRead | null>(null);

  // Reset for a sign-in/sign-out that happens while this form is already
  // mounted — done during render (this repo's convention for syncing local
  // state to a changed prop), not as a synchronous setState in an effect.
  const [prevAuthed, setPrevAuthed] = useState(isAuthenticated);
  if (isAuthenticated !== prevAuthed) {
    setPrevAuthed(isAuthenticated);
    if (isAuthenticated) {
      setAddresses(null); // back to "loading" — the effect below fetches it
    } else {
      setAddresses([]);
      setDraft(EMPTY_DRAFT);
    }
  }

  // The actual async fetch is a genuine external-system sync, so it stays
  // an effect — just skips doing anything for a guest, who has nothing to
  // fetch (handled entirely by the render-time reset above).
  useEffect(() => {
    if (!isAuthenticated) return;
    listAddresses().then((list) => {
      setAddresses(list);
      const defaultAddress = list.find((a) => a.default === 1) ?? list[0];
      setSelectedAddressId(defaultAddress ? defaultAddress.id : "new");
      setDraft({
        ...EMPTY_DRAFT,
        person_name: user?.full_name ?? "",
        phone: user?.phone ?? "",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (order) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <h2 className="text-lg font-bold text-foreground">Order placed!</h2>
        <p className="text-sm text-muted-foreground">
          Order{" "}
          <span className="font-medium text-foreground">
            {order.order_number}
          </span>{" "}
          — total {formatPrice(order.total)}
        </p>
        <Button onClick={() => router.push("/product")}>
          Continue shopping
        </Button>
      </div>
    );
  }

  if (mode === "cart" && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          No items selected for checkout.
        </p>
        <Button variant="outline" onClick={() => router.push("/cart")}>
          Back to cart
        </Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Resolve the address to use for this order. A guest never persists a
    // UserAddress (there's no account to attach one to) — the draft goes
    // straight through as the order's own address snapshot.
    let resolvedAddress: AddressDetail;
    let resolvedAddressId: number | null = null;

    if (!isAuthenticated) {
      // Guest contact goes on the address itself (AddressDetail.email),
      // not as a separate order field — the backend overrides it with the
      // account's real email anyway whenever the caller is signed in.
      resolvedAddress = { ...draft, email: email || undefined };
    } else if (selectedAddressId === "new") {
      const created = await createAddress(
        draft,
        (addresses?.length ?? 0) === 0,
      );
      if (!created) {
        setSubmitting(false);
        setError(
          "Couldn't save that address. Check the details and try again.",
        );
        return;
      }
      resolvedAddress = created.address;
      resolvedAddressId = created.id;
      setAddresses((prev) => [...(prev ?? []), created]);
    } else {
      const existing = addresses?.find((a) => a.id === selectedAddressId);
      if (!existing) {
        setSubmitting(false);
        setError("Select a shipping address.");
        return;
      }
      resolvedAddress = existing.address;
      resolvedAddressId = existing.id;
    }

    if (mode === "direct") {
      const result = await createDirectOrder(
        [
          {
            product_variant_id: directItem!.variantId,
            quantity: directItem!.quantity,
          },
        ],
        resolvedAddress,
      );
      setSubmitting(false);
      if (!result.ok) {
        setError(result.detail);
        return;
      }
      setOrder(result.order);
      return;
    }

    // mode === "cart", signed out: the selected items live only in the
    // guest's local cart (see CartProvider) — there's no backend Cart row
    // to reference, so this is a manual order with several items instead
    // of cart_item_ids. Mirrors the backend's own auto-cleanup of checked-
    // out items in cart mode by removing just the ordered items locally.
    if (!isAuthenticated) {
      const result = await createDirectOrder(
        cartItems
          .filter((item) => item.product_variant_id != null)
          .map((item) => ({
            product_variant_id: item.product_variant_id!,
            quantity: item.quantity,
          })),
        resolvedAddress,
      );
      setSubmitting(false);
      if (!result.ok) {
        setError(result.detail);
        return;
      }
      setOrder(result.order);
      cartItems.forEach((item) => removeItem(item.id));
      return;
    }

    // mode === "cart", signed in: the backend has no per-order address
    // field — it always reads whichever UserAddress is currently flagged
    // default, so a non-default pick has to be promoted first.
    const isAlreadyDefault =
      addresses?.find((a) => a.id === resolvedAddressId)?.default === 1;
    if (!isAlreadyDefault && resolvedAddressId != null) {
      const promoted = await setDefaultAddress(resolvedAddressId);
      if (!promoted) {
        setSubmitting(false);
        setError("Couldn't set that address as default. Please try again.");
        return;
      }
    }

    const result = await createOrderFromCart(
      user!.id,
      Array.from(selectedCartItemIds),
    );
    setSubmitting(false);
    if (!result.ok) {
      setError(result.detail);
      return;
    }
    setOrder(result.order);
    refreshCart();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Checkout</h2>
        {mode === "direct" ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {directItem!.quantity} × {directItem!.name} —{" "}
            {formatPrice(subtotal)}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            {cartItems.length} item{cartItems.length === 1 ? "" : "s"} —{" "}
            {formatPrice(subtotal)}
          </p>
        )}
      </div>

      {addresses === null ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : (
        <AddressSelector
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
          draft={draft}
          onDraftChange={setDraft}
        />
      )}

      {!isAuthenticated && (
        <label className="flex flex-col gap-1.5 text-sm">
          Email (optional) — to keep track of your order
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">
          {formatPrice(subtotal)}
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting || addresses === null}
      >
        {submitting ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
