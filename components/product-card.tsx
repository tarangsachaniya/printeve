import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, stripHtml } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {!!product.discount_percent && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white shadow">
            {product.discount_percent}% off
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-text line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-xs text-text-muted line-clamp-2">{stripHtml(product.description)}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted">From</span>
            <p className="text-base font-bold text-text">{product.starting_price != null ? formatPrice(product.starting_price) : "—"}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View <ArrowRight className="size-4" />
          </span>
        </div>
        {product.delivers_to_city === true && (
          <p className="mt-1.5 text-xs font-medium text-primary">Delivers to your city</p>
        )}
      </div>
    </Link>
  );
}
