import { howItWorks } from "@/data/content";

export function HowItWorks() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            From upload to delivery — a simple, transparent process designed
            to get your prints right the first time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <div key={item.step} className="bg-background p-6">
              <span className="text-sm font-bold text-primary">{item.step}</span>
              <h3 className="mt-3 text-sm font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
