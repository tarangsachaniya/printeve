import { Star } from "lucide-react";
import { testimonials } from "@/data/content";

export function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl container-px">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Trusted by marketing teams, founders and operations leads across
            industries.
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
          {doubled.map((t, i) => (
            <figure
              key={i}
              className="w-80 shrink-0 rounded-lg border border-border bg-background p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-text">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-semibold text-text">{t.name}</p>
                <p className="text-xs text-text-muted">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
