import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductConfigurator } from "@/components/products/product-configurator";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const cityId = (await cookies()).get("printeve_city_id")?.value;
    const cityParam = cityId ? `?city_id=${encodeURIComponent(cityId)}` : "";
    return await api.get<Product>(`/products/${slug}${cityParam}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} name={product.name} />
        <ProductConfigurator product={product} />
      </div>

      {product.description && (
        <div className="mt-12 max-w-3xl border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-text mb-4">Product Details</h2>
          <div className="prose-print" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}
    </div>
  );
}
