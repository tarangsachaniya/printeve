import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronRight } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductConfigurator } from "@/components/products/product-configurator";
import { ProductTabs } from "@/components/products/product-tabs";
import { SimilarProductsCarousel } from "@/components/products/similar-products-carousel";

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
      <div className="mb-6 border-b border-border/60 py-2.5">
        <nav className="flex items-center gap-1.5 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>

          <ChevronRight className="size-3.5 shrink-0" />

          {product.category ? (
            <>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.title}
              </Link>
              <ChevronRight className="size-3.5 shrink-0" />
            </>
          ) : (
            <>
              <Link href="/products" className="hover:text-primary transition-colors">
                Products
              </Link>
              <ChevronRight className="size-3.5 shrink-0" />
            </>
          )}

          <span className="truncate text-text">{product.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={product.images ?? []} videoUrl={product.video_url} name={product.name} />
        </div>
        <ProductConfigurator product={product} />
      </div>

      {product.description && (
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-text mb-4">About this product</h2>
          <div className="prose-print max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      <div className="mt-8 border-t border-border pt-8">
        <ProductTabs
          description={product.description}
          faqs={product.faqs ?? []}
          finishAndCare={product.finish_and_care ?? []}
          specifications={product.specifications ?? []}
        />
      </div>

      <SimilarProductsCarousel
        products={product.related_products ?? []}
        categoryTitle={product.category?.title}
        categorySlug={product.category?.slug}
      />
    </div>
  );
}
