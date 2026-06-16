"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

type MediaItem = { type: "image"; url: string } | { type: "video"; url: string };

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

  const media: MediaItem[] = [
    ...(images.length > 0 ? images : [""]).map((url) => ({ type: "image" as const, url })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
  ];

  const activeItem = media[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface">
        {activeItem.type === "video" ? (
          <video
            key={activeItem.url}
            src={activeItem.url}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <ProductImage src={activeItem.url} alt={name} sizes="(max-width: 1024px) 100vw, 50vw" />
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
