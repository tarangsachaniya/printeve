import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BusinessCardSVG,
  MarketingKitSVG,
  PackagingSVG,
  BannerSVG,
} from "@/components/ui/custom-svgs";
import type { CmsSection } from "@/lib/site-config";

const trustIconMap: Record<string, typeof ShieldCheck> = { ShieldCheck, Clock, Truck };

export function Hero({ section }: { section: CmsSection }) {
  const content = section.content as Record<string, unknown> | null;
  const settings = section.settings as Record<string, unknown> | null;

  const eyebrow = (content?.eyebrow as string) ?? "";
  const headline = section.title ?? "";
  const subtitle = section.subtitle ?? "";
  const ctaPrimary = (content?.cta_primary as string) ?? "";
  const ctaPrimaryHref = (content?.cta_primary_href as string) ?? "/products";
  const ctaSecondary = (content?.cta_secondary as string) ?? "";
  const ctaSecondaryHref = (content?.cta_secondary_href as string) ?? "/about";

  const trustMetrics = (settings?.trust_metrics as { icon: string; label: string; value: string }[]) ?? [];
  const trustBadges = section.items?.filter(i => !i.icon || ['business-cards', 'marketing-kits', 'packaging', 'banners'].includes(i.icon)) ?? [];

  return (
    <section className="relative overflow-hidden border-b border-border" style={{ background: 'var(--gradient-hero)' }}>
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-text-muted">
                <span className="size-1.5 rounded-full bg-primary" />
                {eyebrow}
              </span>
            )}

            {headline && (
              <h1
                className="mt-5 text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl"
                dangerouslySetInnerHTML={{ __html: headline }}
              />
            )}

            {subtitle && (
              <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
                {subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {ctaPrimary && (
                <Button size="lg" asChild>
                  <Link href={ctaPrimaryHref}>
                    {ctaPrimary} <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
              {ctaSecondary && (
                <Button size="lg" variant="outline" asChild>
                  <Link href={ctaSecondaryHref}>{ctaSecondary}</Link>
                </Button>
              )}
            </div>

            {trustMetrics.length > 0 && (
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 max-w-md">
                {trustMetrics.map((metric) => {
                  const Icon = trustIconMap[metric.icon] ?? ShieldCheck;
                  return (
                    <div key={metric.label}>
                      <dt className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <Icon className="size-4 text-primary" /> {metric.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-text">{metric.value}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl border border-border bg-background shadow-[var(--shadow-card)] flex flex-col justify-between p-5">
                <div className="flex-1 flex items-center justify-center pb-4">
                  <BusinessCardSVG className="w-full h-full max-w-[180px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Business Cards</p>
                  <p className="text-xs text-text-muted mt-1">Premium matte &amp; foil finishes</p>
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl border border-border bg-primary/5 shadow-[var(--shadow-card)] flex flex-col justify-between p-5 mt-8">
                <div className="flex-1 flex items-center justify-center pb-4">
                  <MarketingKitSVG className="w-full h-full max-w-[180px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Marketing Kits</p>
                  <p className="text-xs text-text-muted mt-1">Flyers, brochures &amp; posters</p>
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl border border-border bg-primary/5 shadow-[var(--shadow-card)] flex flex-col justify-between p-5 -mt-8">
                <div className="flex-1 flex items-center justify-center pb-4">
                  <PackagingSVG className="w-full h-full max-w-[180px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Packaging</p>
                  <p className="text-xs text-text-muted mt-1">Branded boxes &amp; mailers</p>
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl border border-border bg-background shadow-[var(--shadow-card)] flex flex-col justify-between p-5">
                <div className="flex-1 flex items-center justify-center pb-4">
                  <BannerSVG className="w-full h-full max-w-[180px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Banners</p>
                  <p className="text-xs text-text-muted mt-1">Indoor &amp; outdoor durable print</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
