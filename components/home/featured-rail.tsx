import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, TicketPercent } from "lucide-react";
import { getFeatured } from "@/lib/featured";
import type { FeaturedItem } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/utils";

function CategoryTile({ item }: { item: Extract<FeaturedItem, { type: "category" }> }) {
  const { category } = item;
  const image = category.image_url ?? category.icon_url;
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-text line-clamp-1">{category.title}</h3>
        <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
          Browse <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

function OfferTile({ item }: { item: Extract<FeaturedItem, { type: "offer" }> }) {
  const { offer } = item;
  const discountLabel = offer.discount_type === "percentage" ? `${offer.discount_value}% OFF` : `${formatPrice(offer.discount_value)} OFF`;
  return (
    <div className="flex w-64 shrink-0 flex-col justify-between rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div>
        <TicketPercent className="size-6 text-primary" />
        <p className="mt-3 text-lg font-bold text-text">{discountLabel}</p>
        <p className="mt-1 text-xs text-text-muted">
          Use code <span className="font-mono font-semibold text-text">{offer.code}</span>
        </p>
      </div>
      <p className="mt-4 text-xs text-text-muted">
        Valid until {new Date(offer.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </p>
    </div>
  );
}

function CampaignTile({ item }: { item: Extract<FeaturedItem, { type: "campaign" }> }) {
  const { campaign } = item;
  const href =
    campaign.redirect_type === "product" ? `/products/${campaign.redirect_value}`
    : campaign.redirect_type === "category" ? `/products?category=${campaign.redirect_value}`
    : campaign.redirect_type === "url" ? campaign.redirect_value ?? "#"
    : "#";

  return (
    <Link
      href={href}
      className="group relative flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={campaign.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {campaign.title && <h3 className="text-sm font-semibold text-text line-clamp-1">{campaign.title}</h3>}
        {campaign.subtitle && <p className="mt-1 text-xs text-text-muted line-clamp-2">{campaign.subtitle}</p>}
        {campaign.cta_label && (
          <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
            {campaign.cta_label} <ArrowRight className="size-4" />
          </span>
        )}
      </div>
    </Link>
  );
}

export async function FeaturedRail() {
  const cityId = (await cookies()).get("printeve_city_id")?.value;
  const items = await getFeatured(cityId);

  if (items.length === 0) return null;

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Featured</h2>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Hand-picked products, categories, and offers.
          </p>
        </div>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            if (item.type === "product") {
              return (
                <div key={item.id} className="w-64 shrink-0">
                  <ProductCard product={item.product} />
                </div>
              );
            }
            if (item.type === "category") return <CategoryTile key={item.id} item={item} />;
            if (item.type === "offer") return <OfferTile key={item.id} item={item} />;
            return <CampaignTile key={item.id} item={item} />;
          })}
        </div>
      </div>
    </section>
  );
}
