// Independent of admin's session (see ../../AGENTS.md) — own cookie names
// so the two apps never collide if ever run against the same domain.
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Falls back to 30 days if a token's real expiry can't be decoded.
export const DEFAULT_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
