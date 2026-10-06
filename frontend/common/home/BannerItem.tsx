import Link from "next/link";
import type { CSSProperties } from "react";

import { RICH_TEXT_CLASSNAME } from "@deep-ecommerce/shared/components/cui/richTextClassName";
import { parseBackground, readableTextOn } from "@deep-ecommerce/shared/lib/gradient";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { BannerRead } from "@deep-ecommerce/shared/types/home_types";

const stripTags = (html: string) => html.replace(/<[^>]*>/g, " ").trim();

/**
 * One admin-made banner: image, optional rich text over it, optional click
 * action. Renders on the server — no client JS for a static banner.
 *
 * `width`/`height` (the section's one shared pair) only define the aspect
 * ratio; the box itself is always fluid (`w-full`), which is what keeps it
 * responsive. Without them it falls back to `fallbackClassName`'s aspect.
 */
export default function BannerItem({
  banner,
  width,
  height,
  fallbackClassName = "aspect-video",
  priority = false,
}: {
  banner: BannerRead;
  width: number | null;
  height: number | null;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const hasText = Boolean(banner.content?.trim() || banner.title?.trim());
  // Text-only banners are valid; a banner with nothing at all renders nothing.
  if (!banner.image && !hasText) return null;

  // Only a well-formed background reaches the inline style; anything else
  // (or none) falls back to the theme's card colour.
  const background = parseBackground(banner.background)
    ? banner.background
    : null;
  const tone = readableTextOn(background);
  const textTone =
    tone === "light"
      ? "text-white"
      : tone === "dark"
        ? "text-neutral-900"
        : "text-card-foreground";

  const aspect: CSSProperties | undefined =
    width && height ? { aspectRatio: `${width} / ${height}` } : undefined;
  const style: CSSProperties | undefined =
    aspect || background
      ? { ...aspect, ...(background ? { background } : {}) }
      : undefined;
  const label =
    banner.title ||
    (banner.content ? stripTags(banner.content) : "") ||
    "Open banner";
  const link = banner.link_url;
  const isInternal = link?.startsWith("/") ?? false;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        // No custom background → the theme card colour (with an edge, so a
        // text-only card is visible against the page).
        !background && "border border-border bg-card",
        !aspect && fallbackClassName,
      )}
      style={style}
    >
      {banner.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.image.original}
          alt={banner.title ?? ""}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Text-only banner: copy centred on the banner's own background. */}
      {!banner.image && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center",
            textTone,
          )}
        >
          {banner.content ? (
            <div
              className={cn(
                RICH_TEXT_CLASSNAME,
                "text-sm md:text-base [&_a]:pointer-events-auto [&_a]:text-inherit",
              )}
              dangerouslySetInnerHTML={{ __html: banner.content }}
            />
          ) : (
            <p className="text-lg font-bold md:text-2xl">{banner.title}</p>
          )}
        </div>
      )}

      {banner.image && banner.content && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-3 pt-10 text-white md:p-5 md:pt-14">
          <div
            // Admin-authored HTML (homepage:manage permission only), same
            // trust level as a product description.
            className={cn(
              RICH_TEXT_CLASSNAME,
              "text-sm md:text-base [&_a]:pointer-events-auto [&_a]:text-white",
            )}
            dangerouslySetInnerHTML={{ __html: banner.content }}
          />
        </div>
      )}

      {/* Stretched link over the whole banner — a sibling of the text (not
          a wrapper) so rich text containing its own links stays valid HTML. */}
      {link &&
        (isInternal ? (
          <Link
            href={link}
            aria-label={label}
            target={banner.open_in_new_tab ? "_blank" : undefined}
            className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        ) : (
          <a
            href={link}
            aria-label={label}
            target={banner.open_in_new_tab ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        ))}
    </div>
  );
}
