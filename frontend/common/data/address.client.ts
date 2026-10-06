import { fetching } from "@deep-ecommerce/shared/api/client";

// Mirrors backend AddressDetail/UserAddress (src/api/models/addressModel.py).
export interface AddressDetail {
  city: string;
  phone?: string;
  person_name?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  details: string;
  // Guest contact only — a signed-in order's contact is the account's own
  // email, which the backend fills in itself (overriding anything sent
  // here). Lives on the address rather than as a separate order field.
  email?: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  address: AddressDetail;
  default: number;
}

export async function listAddresses(): Promise<UserAddress[]> {
  const res = await fetching<UserAddress[]>({
    url: "/api/address/list?limit=50",
    method: "GET",
    showLoader: false,
  });
  return res.data ?? [];
}

export async function createAddress(
  address: AddressDetail,
  makeDefault = false,
): Promise<UserAddress | null> {
  const res = await fetching<UserAddress>({
    url: "/api/address/create",
    method: "POST",
    body: { address, default: makeDefault ? 1 : 0 },
  });
  return res.ok ? (res.data ?? null) : null;
}

/**
 * Cart-mode order creation has no way to specify a per-order address — the
 * backend always pulls whichever UserAddress currently has default=1. So
 * placing a cart order against a non-default existing address means
 * marking it default first (see OrderForm). Direct/manual orders don't
 * need this at all — they send the address inline in the order/create
 * call itself, regardless of which one is flagged default.
 */
export async function setDefaultAddress(id: number): Promise<boolean> {
  const res = await fetching({
    url: `/api/address/set-default/${id}`,
    method: "POST",
  });
  return res.ok;
}
