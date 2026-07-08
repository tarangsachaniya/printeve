"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Layers, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Category, Product, ProductListResponse } from "@/lib/types";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function SearchModal({ open, onOpenChange, categories }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset per open
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());

    if (products !== null) return;
    setLoading(true);
    api
      .get<ProductListResponse>("/products?page=1&limit=100")
      .then((res) => setProducts(res.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open, products]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !products) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q))
      .slice(0, 9);
  }, [products, query]);

  function goTo(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function handleAdvancedSearch() {
    goTo(`/products${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <div className="flex items-center gap-3 border-b border-border pl-5 pr-12 py-4">
          <Search className="size-5 shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdvancedSearch();
            }}
            type="search"
            placeholder="Search products..."
            className="w-full bg-transparent text-base text-text placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] max-h-[65vh] sm:max-h-[60vh]">
          {/* Categories */}
          <div className="border-b border-border sm:border-b-0 sm:border-r sm:overflow-y-auto">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Categories
            </p>
            <div className="flex flex-col pb-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => goTo(`/products?category=${category.slug}`)}
                  className="flex items-center gap-2 px-4 py-2 text-left text-sm font-medium text-text hover:bg-surface transition-colors"
                >
                  {category.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.icon_url} alt="" className="size-4 object-contain" />
                  ) : (
                    <Layers className="size-4 text-primary" />
                  )}
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto p-4">
            {!query.trim() ? (
              <p className="py-10 text-center text-sm text-text-muted">Start typing to search products…</p>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            ) : results.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-muted">No products found for &ldquo;{query}&rdquo;</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex flex-col overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-primary/30"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-surface">
                      <ProductImage src={product.images?.[0]} alt={product.name} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-text line-clamp-1">{product.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {product.starting_price != null ? formatPrice(product.starting_price) : "—"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdvancedSearch}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-sm font-medium text-primary hover:bg-surface transition-colors"
        >
          View advance search results <ArrowRight className="size-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
