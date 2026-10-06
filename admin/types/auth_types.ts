// ─── Roles & permissions ───────────────────────────────────────────────────
// Mirrors backend Role.permissions: a flat list of strings, optionally
// scoped to a shop via shop_id (null = global role).

export interface AuthRole {
  id: number;
  name: string;
  permissions: string[];
  shop_id: number | null;
}

export interface AuthShop {
  id: number;
  name: string;
}

// Shape returned by GET /user/me (backend returns this raw, unwrapped)
export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  image: string | null;
  contactinfo: object | null;
  country: string;
  country_code: string;
  currency_code: string;
  currency_symbol: string;
  verified: boolean;
  is_root: boolean;
  default_shop_id: number | null;
  default_shop: AuthShop | null;
  // Shop the user owns directly (Shop.owner_id), if any.
  shop: AuthShop | null;
  // Shops the user was added to as a member (ShopUser), separate from
  // ownership above — a picker for "select default shop" should offer both.
  shops_member: AuthShop[] | null;
  roles: AuthRole[];
}

// ─── Request payloads ───────────────────────────────────────────────────────

export interface SigninPayload {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  country: string;
  country_code: string;
  currency_code: string;
  currency_symbol: string;
}

// ─── Response payloads ──────────────────────────────────────────────────────

export interface LoginResponseData {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  exp: string;
}
