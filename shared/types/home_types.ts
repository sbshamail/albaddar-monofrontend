import { MediaRead } from "./media_types";

/** Mirrors the backend's HomeSectionType (home_model/homeModel.py). */
export type HomeSectionType =
  | "hero"
  | "carousel"
  | "banner_row"
  | "featured_products"
  | "product_list";

export interface BannerRead {
  id: number;
  section_id: number;
  image: MediaRead | null;
  title: string | null;
  /** Rich-text HTML, laid over the image. */
  content: string | null;
  /** CSS background (solid hex or linear-gradient); null → theme `bg-card`. */
  background: string | null;
  link_url: string | null;
  open_in_new_tab: boolean;
  position: number;
  is_active: boolean;
}

export interface HomeSectionRead {
  id: number;
  type: HomeSectionType;
  title: string | null;
  position: number;
  is_active: boolean;
  /** Pixels — one pair for every banner in the section; defines the aspect ratio. */
  width: number | null;
  height: number | null;
  full_width: boolean;
  columns: number | null;
  autoplay: boolean;
  product_limit: number | null;
  category_id: number | null;
  banners: BannerRead[];
}
