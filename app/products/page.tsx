import { Suspense } from "react";
import { api } from "@/lib/api";
import type { Product, ProductListResponse } from "@/lib/types";
import { ProductsExplorer } from "@/components/products/products-explorer";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await api.get<ProductListResponse>("/products?page=1&limit=100");
    return res.items ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Shop All Products — PrintEve",
  description: "Browse business cards, flyers, brochures, posters, banners, stickers and more.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">All Products</h1>
        <p className="mt-2 text-sm text-text-muted">
          {products.length > 0
            ? `${products.length} products available — customize size, paper and quantity on every item.`
            : "Browse our full range of custom print products."}
        </p>
      </div>

      <Suspense>
        <ProductsExplorer products={products} />
      </Suspense>
    </div>
  );
}
