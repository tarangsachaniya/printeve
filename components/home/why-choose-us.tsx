import { Award, Clock4, Truck, Headset } from "lucide-react";
import type { CmsSection } from "@/lib/site-config";

const iconMap: Record<string, typeof Award> = { Award, Clock4, Truck, Headset };

export function WhyChooseUs({ section }: { section: CmsSection }) {
  const items = (section.items ?? []).map((item) => ({
    title: item.title ?? "",
    description: item.content ?? "",
    Icon: (item.icon && iconMap[item.icon]) || Award,
  }));

  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
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

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-background p-6">
            <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <item.Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
