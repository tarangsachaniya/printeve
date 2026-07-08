"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 12;

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export function ProductsExplorer({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-sync local filters when the URL changes externally
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const filtered = React.useMemo(() => {
    let result = products;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => (a.starting_price ?? 0) - (b.starting_price ?? 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.starting_price ?? 0) - (a.starting_price ?? 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [products, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const suggestions = search.trim() ? filtered.slice(0, 5) : [];
  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    if (suggestionsOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [suggestionsOpen]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when filters change
    setPage(1);
  }, [search, sort]);

  function updateUrl(nextSearch: string) {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    router.replace(`/products${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuggestionsOpen(false);
    updateUrl(search);
  }

  function handleSuggestionSelect(product: Product) {
    setSuggestionsOpen(false);
    router.push(`/products/${product.slug}`);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div ref={searchContainerRef} className="relative flex-1 sm:max-w-sm">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Search products..."
              className="h-10 pl-3 pr-11"
              type="search"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              aria-label="Search"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
            >
              <Search className="size-4" />
            </Button>
          </form>

          {showSuggestions && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-background text-text shadow-[var(--shadow-card-hover)]">
              <div className="max-h-72 overflow-y-auto p-1">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSuggestionSelect(product)}
                    className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm text-text transition-colors hover:bg-surface"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded bg-surface">
                      <ProductImage src={product.images[0]} alt={product.name} sizes="36px" />
                    </div>
                    <span className="flex-1 truncate">{product.name}</span>
                    {product.starting_price != null && (
                      <span className="shrink-0 text-xs text-text-muted">
                        {formatPrice(product.starting_price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active search filter badge */}
      {search && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-text">
            Search: {search}
            <button
              onClick={() => {
                setSearch("");
                updateUrl("");
              }}
            >
              <X className="size-3" />
            </button>
          </span>
        </div>
      )}

      {/* Results */}
      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <p className="text-base font-medium text-text">No products found</p>
          <p className="mt-1 text-sm text-text-muted">
            Try adjusting your search.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
