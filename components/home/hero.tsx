import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trustBadges } from "@/data/content";
import {
  BusinessCardSVG,
  MarketingKitSVG,
  PackagingSVG,
  BannerSVG,
} from "@/components/ui/custom-svgs";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border" style={{ background: 'var(--gradient-hero)' }}>
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-text-muted">
              <span className="size-1.5 rounded-full bg-primary" />
              Trusted by 10,000+ businesses across India
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
              Premium prints, made for{" "}
              <span className="text-primary">your brand</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted sm:text-lg">
              From business cards to bulk packaging — order professional print
              jobs online with transparent pricing, fast turnarounds, and
              quality you can trust on every run.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">
                  Start an Order <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">How It Works</Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 max-w-md">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <ShieldCheck className="size-4 text-primary" /> Quality
                </dt>
                <dd className="mt-1 text-sm font-semibold text-text">Guaranteed</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <Clock className="size-4 text-primary" /> Turnaround
                </dt>
                <dd className="mt-1 text-sm font-semibold text-text">From 24 hrs</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                  <Truck className="size-4 text-primary" /> Delivery
                </dt>
                <dd className="mt-1 text-sm font-semibold text-text">Pan-India</dd>
              </div>
            </dl>
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

        {/* Trust strip */}
        <div className="mt-16 border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustBadges.map((badge) => (
              <span key={badge} className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
