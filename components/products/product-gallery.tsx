"use client";

import * as React from "react";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const gallery = images.length > 0 ? images : [""];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface">
        <ProductImage src={gallery[active]} alt={name} sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border bg-surface transition-colors",
                active === i ? "border-primary" : "border-border hover:border-primary/50"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <ProductImage src={img} alt={`${name} ${i + 1}`} sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
