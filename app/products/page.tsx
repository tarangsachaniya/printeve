import { Suspense } from "react";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import type { Product, ProductListResponse } from "@/lib/types";
import { ProductsExplorer } from "@/components/products/products-explorer";

async function getProducts(category?: string): Promise<Product[]> {
  try {
    const cityId = (await cookies()).get("printeve_city_id")?.value;
    const cityParam = cityId ? `&city_id=${encodeURIComponent(cityId)}` : "";
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : "";
    const res = await api.get<ProductListResponse>(`/products?page=1&limit=100${cityParam}${categoryParam}`);
    return res.items ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Shop All Products — PrintEve",
  description: "Browse business cards, flyers, brochures, posters, banners, stickers and more.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const products = await getProducts(category);

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
