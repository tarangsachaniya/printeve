import { cookies } from "next/headers";
import { getRecommended, recommendedSectionTitle } from "@/lib/recommended";
import { ProductCard } from "@/components/product-card";

export async function RecommendedRail() {
  const cityId = (await cookies()).get("printeve_city_id")?.value;
  const { items, mode } = await getRecommended(cityId);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {recommendedSectionTitle(mode)}
        </h2>
      </div>

      <div className="mt-8 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((product) => (
          <div key={product.id} className="w-64 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
