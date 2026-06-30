"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

type MediaItem = { type: "image"; url: string } | { type: "video"; url: string };

// Narrow type for the autoplay plugin interface exposed by emblaApi.plugins()
type AutoplayPlugin = {
  play(): void;
  stop(): void;
  reset(): void;
  isPlaying(): boolean;
};

function getAutoplayPlugin(emblaApi: ReturnType<typeof useEmblaCarousel>[1]): AutoplayPlugin | undefined {
  if (!emblaApi) return undefined;
  const plugins = emblaApi.plugins() as Record<string, unknown>;
  return plugins?.autoplay as AutoplayPlugin | undefined;
}

export function ProductGallery({
  images,
  videoUrl,
  name,
}: {
  images: string[];
  videoUrl?: string | null;
  name: string;
}) {
  const media: MediaItem[] = React.useMemo(
    () => [
      ...images.map((url) => ({ type: "image" as const, url })),
      ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
    ],
    [images, videoUrl]
  );

  // Which slide index holds the video (-1 = none)
  const videoIndex = React.useMemo(
    () => media.findIndex((m) => m.type === "video"),
    [media]
  );

  // Direct ref to the <video> element so we can call play() / pause()
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Stable autoplay plugin instance — must not be recreated on re-renders
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplayPlugin.current]
  );

  // React state only mirrors Embla's position — NOT authoritative
  const [activeIndex, setActiveIndex] = React.useState(0);

  // ── Slide-change handler ──────────────────────────────────────────────────
  // Responsibilities:
  //   • Keep activeIndex in sync
  //   • If landing on the video slide → play video, stop carousel autoplay
  //   • If leaving the video slide    → pause video, resume carousel autoplay
  React.useEffect(() => {
    if (!emblaApi) return;

    const stopCarouselAutoplay = () => {
      getAutoplayPlugin(emblaApi)?.stop();
    };

    const isOnVideoSlide = () =>
      videoIndex >= 0 && emblaApi.selectedScrollSnap() === videoIndex;

    // Autoplay's next() calls startAutoplay() *after* goToNext(), which can
    // restart the timer on the video slide after our select handler already
    // called stop(). Re-stop whenever a timer is armed on the video slide.
    const onAutoplayTimerSet = () => {
      if (isOnVideoSlide()) {
        stopCarouselAutoplay();
      }
    };

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setActiveIndex(idx);

      const ap = getAutoplayPlugin(emblaApi);

      if (videoIndex >= 0 && idx === videoIndex) {
        // Entering video slide
        const video = videoRef.current;
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {
            // Autoplay may be blocked by browser policy — user will see controls
          });
        }
        // Stop immediately and again after autoplay's next() may restart it.
        stopCarouselAutoplay();
        queueMicrotask(stopCarouselAutoplay);
      } else {
        // Leaving (or not on) video slide
        const video = videoRef.current;
        if (video && !video.paused) {
          video.pause();
          video.currentTime = 0;
        }
        // Resume autoplay only if it was stopped
        if (ap && !ap.isPlaying()) {
          ap.play();
          ap.reset();
        }
      }
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("autoplay:timerset", onAutoplayTimerSet);
    onSelect(); // sync immediately on mount

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("autoplay:timerset", onAutoplayTimerSet);
    };
  }, [emblaApi, videoIndex]);

  // ── Video ended ───────────────────────────────────────────────────────────
  // When the video finishes, advance to the next slide and let autoplay
  // take over again from that point.
  const handleVideoEnded = React.useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    // Resume autoplay from the next slide with a fresh timer
    const ap = getAutoplayPlugin(emblaApi);
    ap?.play();
    ap?.reset();
  }, [emblaApi]);

  const stopCarouselAutoplayOnVideoPlay = React.useCallback(() => {
    getAutoplayPlugin(emblaApi)?.stop();
  }, [emblaApi]);

  // ── Arrow + thumbnail handlers ────────────────────────────────────────────
  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = React.useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (media.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main viewer ── */}
      <div className="relative aspect-square w-full rounded-lg border border-border bg-surface">

        {/* Embla viewport — absolute inset-0 gives Embla a concrete pixel height */}
        <div ref={emblaRef} className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="flex h-full">
            {media.map((item, i) => (
              <div
                key={i}
                className="relative h-full w-full flex-[0_0_100%]"
              >
                {item.type === "video" ? (
                  // Note: NO autoPlay attribute — we call video.play() programmatically
                  // when the slide becomes active so it works reliably across browsers.
                  // NO loop — video plays once, then onEnded fires to advance the carousel.
                  <video
                    ref={videoRef}
                    src={item.url}
                    controls
                    muted
                    playsInline
                    onPlay={stopCarouselAutoplayOnVideoPlay}
                    onEnded={handleVideoEnded}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <ProductImage
                    src={item.url}
                    alt={`${name} ${i + 1}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows — z-10 above the Embla viewport */}
        {media.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border bg-surface transition-colors",
                activeIndex === i
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              )}
              aria-label={item.type === "video" ? "Play video" : `View image ${i + 1}`}
            >
              {item.type === "video" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <Play className="size-6 fill-white text-white" />
                </div>
              ) : (
                <ProductImage src={item.url} alt={`${name} ${i + 1}`} sizes="64px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
