import { HomeSectionRead } from "@deep-ecommerce/shared/types/home_types";

import BannerItem from "./BannerItem";

// Static class strings (not template-built) so Tailwind's scanner sees them.
// Phones show two per row at most; the full count kicks in from md/lg up.
const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

const GAP_PX = 12; // keep in sync with gap-3

/** N banners side by side (default 4). */
export default function BannerRow({ section }: { section: HomeSectionRead }) {
  const columns = Math.min(Math.max(section.columns ?? 4, 1), 6);
  const { width } = section;
  console.log(section.banners);
  return (
    <div
      className={`mx-auto grid w-full gap-3 ${GRID_COLS[columns]}`}
      // With a width set, cap the row at exactly N banners of that width —
      // each banner is then its configured size on wide screens and shrinks
      // proportionally below that. Unset = fill the page width.
      style={
        width
          ? { maxWidth: columns * width + (columns - 1) * GAP_PX }
          : undefined
      }
    >
      {section.banners.map((banner) => (
        <BannerItem
          key={banner.id}
          banner={banner}
          width={section.width}
          height={section.height}
          fallbackClassName="aspect-4/3"
        />
      ))}
    </div>
  );
}
