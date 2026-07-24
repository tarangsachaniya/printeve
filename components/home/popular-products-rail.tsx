import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

// Driven by products.is_featured (set in the admin product form) rather than a
// separate curation table — matches the mobile app's Popular rail.
export function PopularProductsRail({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Popular</h2>
        </div>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div key={product.id} className="w-64 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
