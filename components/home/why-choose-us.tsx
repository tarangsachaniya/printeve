import { Award, Clock4, Truck, Headset } from "lucide-react";
import { whyChooseUs } from "@/data/content";

const icons = [Award, Clock4, Truck, Headset];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Why Businesses Choose PrintEve
        </h2>
        <p className="mt-2 text-sm text-text-muted sm:text-base">
          We combine professional-grade production with a streamlined online
          ordering experience — built for businesses that need reliable
          quality at scale.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {whyChooseUs.map((item, i) => {
          const Icon = icons[i];
          return (
            <div key={item.title} className="rounded-lg border border-border bg-background p-6">
              <span className="flex size-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
