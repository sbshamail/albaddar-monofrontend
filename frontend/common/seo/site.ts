// Single source of truth for the brand name used in image alt text etc.
// (app/layout.tsx still has its own copy for metadata — keep them in sync.)
// Must be NEXT_PUBLIC_*: ProductCard is a client component, and a plain
// SITE_NAME is undefined in the browser — server and client would render
// different alt text (hydration mismatch).
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "AlBaddar";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Descriptive, not keyword-stuffed: "<product> – <brand>". Google Images uses
// alt text to understand what the picture shows, and appending the brand
// once helps the image associate with the site without looking spammy.
export function productImageAlt(name: string): string {
  return `${name} - ${SITE_NAME}`;
}
