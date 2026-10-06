import { AuthUser } from "@/types/auth_types";

// Mirrors src/api/core/security.py's permission logic (get_user_permissions,
// require_permission, require_shop_admin, require_shop_permission) so the UI
// can show/hide controls consistently with what the backend will allow.
//
// IMPORTANT: this is a UX convenience only, never a security boundary.
// The backend re-checks every request against the real, signed JWT — these
// helpers just avoid flashing controls the user can't actually use.

export const SUPER_ADMIN_PERMISSIONS = ["system:*", "all"];
export const SHOP_ADMIN_PERMISSION = "shop:*";

export function getPermissions(user: AuthUser | null | undefined): Set<string> {
  const perms = new Set<string>();
  if (!user) return perms;
  for (const role of user.roles ?? []) {
    for (const p of role.permissions ?? []) perms.add(p);
  }
  return perms;
}

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_root) return true;
  const perms = getPermissions(user);
  return SUPER_ADMIN_PERMISSIONS.some((p) => perms.has(p));
}

/** Global (non-shop-scoped) permission check. */
export function hasPermission(
  user: AuthUser | null | undefined,
  ...permissions: string[]
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const perms = getPermissions(user);
  return permissions.some((p) => perms.has(p));
}

/** True if the user holds the shop-admin role for the given shop (defaults to their active shop). */
export function isShopAdmin(
  user: AuthUser | null | undefined,
  shopId?: number | null,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const targetShopId = shopId ?? user.default_shop_id;
  if (targetShopId == null) return false;
  return (user.roles ?? []).some(
    (r) => r.shop_id === targetShopId && r.permissions.includes(SHOP_ADMIN_PERMISSION),
  );
}

/** Shop-scoped permission check (defaults to the user's active shop). */
export function hasShopPermission(
  user: AuthUser | null | undefined,
  shopId: number | null | undefined,
  ...permissions: string[]
): boolean {
  if (!user) return false;
  const targetShopId = shopId ?? user.default_shop_id;
  if (targetShopId == null) return false;
  if (isShopAdmin(user, targetShopId)) return true;
  return (user.roles ?? []).some(
    (r) => r.shop_id === targetShopId && permissions.some((p) => r.permissions.includes(p)),
  );
}
