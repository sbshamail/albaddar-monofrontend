"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@deep-ecommerce/shared/components/ui/carousel";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { toEmbedUrl } from "./videoEmbed";

type Slide =
  | { type: "image"; url: string }
  | { type: "video"; url: string; embedUrl: string | null };

export default function ProductGallery({
  images,
  alt,
  video_url,
}: {
  images: string[];
  alt: string;
  video_url?: string | null;
}) {
  // Video first, matching the common storefront pattern (product video
  // leads the gallery, images follow) — one swipeable rail instead of a
  // separate section elsewhere on the page.
  const slides: Slide[] = [
    ...(video_url
      ? [{ type: "video" as const, url: video_url, embedUrl: toEmbedUrl(video_url) }]
      : []),
    ...images.map((url) => ({ type: "image" as const, url })),
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [thumbApi, setThumbApi] = useState<CarouselApi>();

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track || index < 0 || index >= slides.length) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  // Keep the mobile thumbnail strip scrolled to whichever slide the main
  // track landed on, so swiping the main image also brings its thumbnail
  // into view instead of leaving the highlight off-screen.
  useEffect(() => {
    thumbApi?.scrollTo(active);
  }, [thumbApi, active]);

  // The actual swipe motion is native scroll-snap (below) — this just reads
  // back whichever slide the user landed on, to keep the thumbnail
  // highlight/dots in sync. rAF-throttled since `scroll` fires continuously
  // during the swipe.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setActive(Math.round(track.scrollLeft / width));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-3">
      {/* Thumbnail rail: desktop only — on mobile every bit of width goes to
          the slide itself, swipe (below) is the navigation there. */}
      {slides.length > 1 && (
        <div className="hidden md:flex md:flex-col md:gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.url + i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-md border",
                active === i ? "border-primary" : "border-border",
              )}
            >
              {slide.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Play className="size-5 text-foreground" fill="currentColor" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div
          ref={trackRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg border border-border bg-muted scrollbar-none"
        >
          {slides.length === 0 && (
            <div className="flex aspect-square w-full shrink-0 snap-center items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}

          {slides.map((slide, i) => (
            <div
              key={slide.url + i}
              className="aspect-square w-full shrink-0 snap-center"
            >
              {slide.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.url}
                  alt={alt}
                  className="h-full w-full object-contain"
                />
              )}

              {slide.type === "video" &&
                (slide.embedUrl ? (
                  <iframe
                    src={slide.embedUrl}
                    title="Product video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <a
                    href={slide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center text-sm text-primary hover:underline"
                  >
                    Watch video
                  </a>
                ))}
            </div>
          ))}
        </div>

        {/* Mobile's stand-in for the hidden vertical thumbnail rail: one
            horizontally-scrolling row of the actual slide pictures (not
            dots) — dragFree + trimSnaps gives a free-scrolling strip rather
            than snapping each thumbnail to center. */}
        {slides.length > 1 && (
          <Carousel
            setApi={setThumbApi}
            opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
            className="mt-2 md:hidden"
          >
            <CarouselContent className="-ml-2">
              {slides.map((slide, i) => (
                <CarouselItem key={slide.url + i} className="basis-auto pl-2">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "size-14 shrink-0 overflow-hidden rounded-md border",
                      active === i ? "border-primary" : "border-border",
                    )}
                  >
                    {slide.type === "video" ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Play
                          className="size-5 text-foreground"
                          fill="currentColor"
                        />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </div>
  );
}
