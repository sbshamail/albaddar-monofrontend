import type { MetadataRoute } from "next";

import { getProductList } from "@/common/data/products";
import { SITE_URL } from "@/common/seo/site";

// Rebuilt at most hourly — fresh enough for new products, cheap for the API.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = ["", "/product", "/about", "/contactus"].map(
    (path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "daily" as const }),
  );

  // A backend outage shouldn't break the sitemap — fall back to static pages.
  let products: MetadataRoute.Sitemap = [];
  try {
    const { data } = await getProductList({ limit: 1000 });
    products = data.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: p.updated_at ?? p.created_at,
      changeFrequency: "weekly" as const,
    }));
  } catch {}

  return [...staticPages, ...products];
}
