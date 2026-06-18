import type { CmsSection } from "@/lib/site-config";

export function HowItWorks({ section }: { section: CmsSection }) {
  const items = (section.items ?? []).map((item) => ({
    step: (item.metadata?.step as string) ?? "",
    title: item.title ?? "",
    description: item.content ?? "",
  }));

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl container-px py-16 lg:py-20">
        <div className="max-w-2xl">
          {section.title && (
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {section.title}
            </h2>
          )}
          {section.subtitle && (
            <p className="mt-2 text-sm text-text-muted sm:text-base">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
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
