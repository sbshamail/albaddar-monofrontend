// Single source of truth for the site's identity — brand name, URL, tagline,
// SEO defaults. Used by BOTH apps (admin + frontend). Plain constants on
// purpose: no process.env, no imports, so it's safe in server AND client
// components and in next.config.ts alike.
//
// Reusing this codebase for another shop? Edit THIS file only (plus swap the
// logo/banner images in shared/public/images and frontend/app/{icon,
// opengraph-image,twitter-image}.png — image files can't be driven from here).
//
// Imported as "@site-config" (tsconfig paths in each app); next.config.ts
// can't use tsconfig paths, so it imports "../site.config" directly.

const url = "https://albadar.buyagain.pk";
const host = new URL(url).hostname;

export const siteConfig = {
  /** Brand name — page titles, og:site_name, alt text, headings. */
  name: "AlBadar",
  /** Brand as written in running copy ("We're back — as AlBadar.buyagain.pk"). */
  displayDomain: "AlBadar.buyagain.pk",
  /** Canonical production origin — metadataBase, sitemap, absolute URLs. */
  url,
  tagline: "Buy once, love it, buy again.",
  /** Default meta description (pages that don't set their own). */
  description: "Shop across every category in one place.",
  /** og:locale */
  locale: "en_PK",
  /** Extra origins allowed to hit the dev server (Next `allowedDevOrigins`). */
  devOrigins: [`test.${host}`, host],
  /** Prefix for localStorage keys, so two sites on one browser never clash.
   * Changing it orphans anything users already have stored (e.g. guest cart). */
  storagePrefix: "albadar",
};

// Descriptive, not keyword-stuffed: "<product> - <brand>". Google Images uses
// alt text to understand what the picture shows, and appending the brand
// once helps the image associate with the site without looking spammy.
// Lives here (not in a component) so server and client render identical text.
export function productImageAlt(name: string): string {
  return `${name} - ${siteConfig.name}`;
}
