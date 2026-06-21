"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  starting_price: number | null;
  images: string[];
}

interface SimilarProductsCarouselProps {
  products: RelatedProduct[];
  categoryTitle?: string;
  categorySlug?: string;
}

export function SimilarProductsCarousel({
  products,
  categoryTitle,
  categorySlug,
}: SimilarProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function sync() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [products]);

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("a") as HTMLElement | null;
    const step = (card?.offsetWidth ?? 264) + 20;
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  }

  if (!products.length) return null;

  return (
    <section className="mt-16">
      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Header row */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            You may also like
          </p>
          <h2 className="text-2xl font-bold text-text leading-tight">
            More in{" "}
            {categorySlug ? (
              <Link
                href={`/products?category=${categorySlug}`}
                className="underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
              >
                {categoryTitle ?? "Related Products"}
              </Link>
            ) : (
              <span>{categoryTitle ?? "Related Products"}</span>
            )}
          </h2>
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={() => scroll("left")}
            disabled={!canLeft}
            aria-label="Previous slide"
            className="group flex size-10 items-center justify-center rounded-full border border-border bg-background text-text-muted transition-all hover:border-primary/60 hover:text-primary hover:shadow-[var(--shadow-card)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canRight}
            aria-label="Next slide"
            className="group flex size-10 items-center justify-center rounded-full border border-border bg-background text-text-muted transition-all hover:border-primary/60 hover:text-primary hover:shadow-[var(--shadow-card)] disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex-none w-[248px] rounded-2xl border border-border bg-background overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/25 focus-ring"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              <ProductImage
                src={product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              {/* Category pill */}
              {categoryTitle && (
                <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-background/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted border border-border/60">
                  {categoryTitle}
                </span>
              )}
            </div>

            {/* Card body */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text leading-snug line-clamp-2 mb-3">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div className="leading-none">
                  <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
                    From
                  </span>
                  <span className="text-lg font-bold text-text">
                    {product.starting_price != null ? formatPrice(product.starting_price) : "—"}
                  </span>
                </div>

                {/* Animated arrow badge */}
                <span className="flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-semibold text-primary opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                  Order
                  <ChevronRight className="size-3" />
                </span>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </div>
    </section>
  );
}
