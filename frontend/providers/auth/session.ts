import { cookies } from "next/headers";
import { cache } from "react";

import { authorizedFetch } from "@deep-ecommerce/shared/api/server";
import { AuthUser } from "@/types/auth_types";

import { ACCESS_TOKEN_COOKIE } from "./config";

// Server-only — do not import from a "use client" file (next/headers
// throws at build time if you try). Mirrors admin/providers/auth/session.ts
// exactly in shape, but reads this app's own cookie and hits the plain
// customer /user/read endpoint (no roles/shop concept here).

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Resolves the signed-in customer for the current request, or null.
 * Wrapped in React's cache() so layout + page both calling this in the same
 * request share one /user/read round trip.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await authorizedFetch<AuthUser>("/user/read", token, {
      cache: "no-store",
    });
  } catch {
    return null;
  }
});

/** Decodes a JWT's `exp` claim without verifying its signature — used only
 *  to size the cookie's max-age, never to trust the token's contents. */
export function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}
