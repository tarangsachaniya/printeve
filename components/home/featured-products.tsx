import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await api.get<{ items: Product[] }>("/settings/homepage_featured_products");
    return res.items ?? [];
  } catch {
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
              Our most popular print products, ready to customize and order.
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all products <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
