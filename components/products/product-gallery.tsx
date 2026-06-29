"use client";

import * as React from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

type MediaItem = { type: "image"; url: string } | { type: "video"; url: string };

const AUTO_SLIDE_INTERVAL = 5000;

export function ProductGallery({
  images,
  videoUrl,
  name,
}: {
  images: string[];
  videoUrl?: string | null;
  name: string;
}) {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const media: MediaItem[] = [
    ...(images.length > 0 ? images : [""]).map((url) => ({ type: "image" as const, url })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
  ];

  const activeItem = media[active];

  const goNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const goPrev = React.useCallback(() => {
    setActive((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  React.useEffect(() => {
    if (media.length <= 1 || paused) return;
    if (activeItem.type === "video") return;

    const timer = setInterval(goNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [media.length, paused, active, activeItem.type, goNext]);

  const handleVideoEnded = React.useCallback(() => {
    goNext();
  }, [goNext]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {activeItem.type === "video" ? (
          <video
            ref={videoRef}
            key={activeItem.url}
            src={activeItem.url}
            controls
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <ProductImage src={activeItem.url} alt={name} sizes="(max-width: 1024px) 100vw, 50vw" />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    active === i ? "bg-white scale-125 shadow" : "bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border bg-surface transition-colors",
                active === i ? "border-primary" : "border-border hover:border-primary/50"
              )}
              aria-label={item.type === "video" ? "Play video" : `View image ${i + 1}`}
            >
              {item.type === "video" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <Play className="size-6 text-white fill-white" />
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
