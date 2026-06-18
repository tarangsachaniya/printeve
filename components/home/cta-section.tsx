import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="rounded-2xl px-8 py-12 text-center sm:px-16 sm:py-16" style={{ background: 'var(--gradient-brand)' }}>
        <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
          Ready to bring your designs to print?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
          Get instant pricing, upload your artwork, and place your order in
          minutes — with quality guaranteed on every job.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products">
              Browse Products <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
