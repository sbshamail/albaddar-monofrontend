import { backendFetch } from "@deep-ecommerce/shared/api/server";
import { HomeSectionRead } from "@deep-ecommerce/shared/types/home_types";

const section = (
  id: number,
  type: HomeSectionRead["type"],
  extra: Partial<HomeSectionRead>,
): HomeSectionRead => ({
  id,
  type,
  title: null,
  position: id,
  is_active: true,
  width: null,
  height: null,
  full_width: false,
  columns: null,
  autoplay: true,
  product_limit: null,
  category_id: null,
  banners: [],
  ...extra,
});

// What the homepage showed before it became admin-controlled. Used only
// when the layout endpoint is unreachable, so a backend blip never blanks
// the storefront. (An admin-emptied layout is a valid result, not an error.)
export const DEFAULT_HOME_SECTIONS: HomeSectionRead[] = [
  section(-1, "hero", { product_limit: 6 }),
  section(-2, "featured_products", {
    title: "Exclusive Products",
    product_limit: 8,
  }),
  section(-3, "product_list", { title: "Shop Products", product_limit: 12 }),
];

export async function getHomeLayout(): Promise<HomeSectionRead[]> {
  try {
    // Uncached on purpose: admin edits should show on the next page load,
    // and the homepage's product queries are uncached anyway.
    return await backendFetch<HomeSectionRead[]>("/home-section/public", {
      cache: "no-store",
    });
  } catch {
    return DEFAULT_HOME_SECTIONS;
  }
}
