"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@deep-ecommerce/shared/lib/utils";

const AUTO_ADVANCE_MS = 5000;

/**
 * Scroll-snap slider: the track is a native horizontally scrolling flex row,
 * so touch swiping, momentum and keyboard scrolling work with no JS — the
 * arrows, dots and autoplay below just drive that same scroll position.
 * Slides arrive pre-rendered (server components) as `slides`.
 */
export default function BannerCarousel({
  slides,
  autoplay,
  maxWidth,
}: {
  slides: React.ReactNode[];
  autoplay: boolean;
  /** Section width in px — caps (and centers) the carousel. */
  maxWidth?: number | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el || count === 0) return;
      const target = ((i % count) + count) % count;
      el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  // Autoplay is a genuine external side effect (a timer), and is skipped
  // for people who've asked their OS for reduced motion.
  useEffect(() => {
    if (!autoplay || count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [autoplay, count, paused, index, goTo]);

  return (
    <section
      aria-roledescription="carousel"
      className="group/carousel relative mx-auto w-full"
      style={maxWidth ? { maxWidth } : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="w-full shrink-0 snap-center"
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md transition-opacity hover:bg-background group-hover/carousel:opacity-100 focus-visible:opacity-100 md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md transition-opacity hover:bg-background group-hover/carousel:opacity-100 focus-visible:opacity-100 md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full shadow-sm transition-all",
                  i === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-background/70 hover:bg-background",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
