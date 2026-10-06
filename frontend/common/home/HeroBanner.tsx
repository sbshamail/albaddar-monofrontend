"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatPrice, getDisplayPrice } from "@/common/product/priceHelpers";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";

const AUTO_ADVANCE_MS = 4000;

export default function HeroBanner({
  products,
  autoplay = true,
}: {
  products: ProductRead[];
  /** Admin-controlled (homepage section setting). */
  autoplay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  // Pausing on hover is genuine external state too (same reasoning as the
  // timer below) — nobody wants the slide they're reading yanked away.
  const [paused, setPaused] = useState(false);

  // Reset to the first slide whenever the product set itself changes
  // (a fresh server fetch) — same "sync prop → state during render"
  // pattern used elsewhere in this app, not an effect.
  const [prevProducts, setPrevProducts] = useState(products);
  if (products !== prevProducts) {
    setPrevProducts(products);
    setIndex(0);
  }

  const slideCount = products.length;
  const goTo = (i: number) =>
    setIndex(((i % slideCount) + slideCount) % slideCount);

  // Auto-advance is genuine external state (a timer, not derived from
  // props/state), so it's a legitimate effect — pauses itself while there's
  // nothing to rotate through instead of running a no-op interval.
  useEffect(() => {
    if (!autoplay || slideCount < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slideCount);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [autoplay, slideCount, paused]);

  if (slideCount === 0) return null;

  return (
    <section
      className="group/hero relative overflow-hidden rounded-lg bg-linear-to-br from-secondary to-secondary/70 outline-none"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(index - 1);
        if (e.key === "ArrowRight") goTo(index + 1);
      }}
    >
      {/*
       * Mobile vs desktop are two genuinely different designs here, not just
       * resized versions of one layout:
       * - Mobile (default): the real picture sits on top, uncropped. Directly
       *   attached below it is a native CSS mirror reflection of that exact
       *   image (-webkit-box-reflect — a real flipped copy the browser
       *   renders for us, not a second <img>, so it's always pixel-attached
       *   to the actual image regardless of its aspect ratio), fading out as
       *   it goes down. The text is written over that fading reflection —
       *   never over the picture itself. box-reflect is WebKit/Blink-only
       *   (Safari, Chrome — effectively all mobile traffic); it degrades
       *   gracefully to "no reflection" elsewhere, not broken layout.
       * - Desktop (md:): unchanged side-by-side row — image right (a real
       *   square), text left, no reflection/overlay needed once there's room
       *   for both.
       */}
      <div className="relative aspect-5/6 w-full md:aspect-21/7">
        {products.map((product, i) => {
          const { price, comparePrice } = getDisplayPrice(product);
          const image = product.thumbnail?.original ?? null;
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-hidden={i !== index}
              className={cn(
                " absolute inset-0 block transition-opacity duration-500 md:flex md:flex-row md:items-center md:gap-10 md:p-6 md:px-12",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {/* Mobile-only: the real picture, its mirror reflection fading below it via box-reflect */}
              <div className="absolute inset-0  flex justify-center overflow-hidden md:hidden">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={product.name}
                    style={{
                      WebkitBoxReflect:
                        "below 4px linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.45)) ",
                    }}
                    className={cn(
                      "max-h-[80%] max-w-[80%] rounded-2xl object-contain shadow-2xl transition-transform duration-3000 ease-out",
                      i === index ? "scale-100" : "scale-110",
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Desktop-only: classic square thumbnail on the right */}
              <div className="hidden overflow-hidden bg-muted md:block md:aspect-square md:w-2/5 md:shrink-0 md:rounded-lg md:shadow-inner">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={product.name}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-3000 ease-out",
                      i === index ? "scale-100" : "scale-110",
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Text: written over the fading mirror reflection on mobile; plain column on md: */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-linear-to-t from-black/60 to-transparent p-4 pb-5 pt-10 md:static md:inset-auto md:min-w-0 md:flex-1 md:gap-3 md:bg-none md:p-0">
                {comparePrice && (
                  <span className="rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-semibold text-destructive-foreground md:px-3 md:py-1 md:text-xs">
                    On Sale
                  </span>
                )}
                <p className="text-xs font-medium text-white/90 md:text-sm md:text-primary">
                  New arrivals every week
                </p>
                <h1 className="line-clamp-2 max-w-md text-lg font-bold text-white md:text-4xl md:text-foreground">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-white md:text-xl md:text-foreground">
                    {formatPrice(price)}
                  </span>
                  {comparePrice && (
                    <span className="text-xs text-white/70 line-through md:text-sm md:text-muted-foreground">
                      {formatPrice(comparePrice)}
                    </span>
                  )}
                </div>
                <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-transform group-hover/slide:scale-105 md:px-4 md:py-2 md:text-sm">
                  Shop now
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md transition-opacity hover:bg-background md:group-hover/hero:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md transition-opacity hover:bg-background md:group-hover/hero:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {slideCount > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 rounded-full">
          {products.map((product, i) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full shadow-sm transition-all",
                i === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-background/70 hover:bg-background",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
