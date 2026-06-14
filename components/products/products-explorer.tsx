"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { useCategories } from "@/lib/category";
import { cn } from "@/lib/utils";

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
  const { categories } = useCategories();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [category, setCategory] = React.useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-sync local filters when the URL changes externally
    setSearch(searchParams.get("search") ?? "");
    setCategory(searchParams.get("category") ?? "all");
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
        sorted.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.base_price - a.base_price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [products, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when filters change
    setPage(1);
  }, [search, category, sort]);

  function updateUrl(nextSearch: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextCategory !== "all") params.set("category", nextCategory);
    router.replace(`/products${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateUrl(search, category);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    updateUrl(search, value);
  }

  const filtersContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Category</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "rounded-md px-3 py-2 text-left text-sm transition-colors",
              category === "all" ? "bg-primary/10 text-primary font-medium" : "text-text-muted hover:bg-surface"
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm transition-colors",
                category === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-text-muted hover:bg-surface"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      {/* Desktop filters */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-background p-5">
          {filtersContent}
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
              type="search"
            />
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
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
        </div>

        {/* Mobile filters */}
        {mobileFiltersOpen && (
          <div className="mb-6 rounded-lg border border-border bg-background p-5 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X className="size-4 text-text-muted" />
              </button>
            </div>
            {filtersContent}
          </div>
        )}

        {/* Active filters */}
        {(search || category !== "all") && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {search && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-text">
                Search: {search}
                <button
                  onClick={() => {
                    setSearch("");
                    updateUrl("", category);
                  }}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {category !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-text">
                {categories.find((c) => c.slug === category)?.name}
                <button onClick={() => handleCategoryChange("all")}>
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
            <p className="text-base font-medium text-text">No products found</p>
            <p className="mt-1 text-sm text-text-muted">
              Try adjusting your search or filters.
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
    </div>
  );
}
