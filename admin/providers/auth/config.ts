export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Falls back to 30 days if a token's real expiry can't be decoded.
export const DEFAULT_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

// Pages for signed-out visitors only (e.g. signin/register) — an already
// signed-in user landing here is bounced to DEFAULT_AUTHENTICATED_PATH.
export const GUEST_ONLY_PATHS = ["/signin", "/register"];

// Pages that render for signed-in AND signed-out visitors alike — no
// redirect either way. To make a new page skip auth entirely, add its path
// here. If it also lives inside the (dashboard) shell, add it to
// OPTIONAL_AUTH_DASHBOARD_PATHS too so the layout doesn't force a redirect.
export const OPTIONAL_AUTH_PATHS: string[] = [];

// Subset of OPTIONAL_AUTH_PATHS that live inside the (dashboard) route group
// — read by that layout (via the x-pathname header proxy.ts sets) to decide
// whether to call requireUser().
export const OPTIONAL_AUTH_DASHBOARD_PATHS: string[] = [];

// Every path proxy.ts lets through without an access-token cookie present.
export const PUBLIC_PATHS = [...GUEST_ONLY_PATHS, ...OPTIONAL_AUTH_PATHS];

// Where to send a signed-in user who lands on a guest-only path.
export const DEFAULT_AUTHENTICATED_PATH = "/";

export function matchesPath(paths: string[], pathname: string): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
