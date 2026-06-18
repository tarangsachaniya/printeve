import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsSection } from "@/lib/site-config";

export function CtaSection({ section }: { section: CmsSection }) {
  const content = section.content as Record<string, string> | null;
  const ctaPrimary = content?.cta_primary ?? "";
  const ctaPrimaryHref = content?.cta_primary_href ?? "/products";
  const ctaSecondary = content?.cta_secondary ?? "";
  const ctaSecondaryHref = content?.cta_secondary_href ?? "/contact";

  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="rounded-2xl px-8 py-12 text-center sm:px-16 sm:py-16" style={{ background: 'var(--gradient-brand)' }}>
        {section.title && (
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            {section.subtitle}
          </p>
        )}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ctaPrimary && (
            <Button size="lg" variant="secondary" asChild>
              <Link href={ctaPrimaryHref}>
                {ctaPrimary} <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          {ctaSecondary && (
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href={ctaSecondaryHref}>{ctaSecondary}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
