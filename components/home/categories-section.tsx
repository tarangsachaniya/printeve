import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-2 max-w-xl text-sm text-text-muted sm:text-base">
            Everything your business needs to look its best — printed to spec
            and delivered fast.
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View all products <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
          >
            <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <cat.icon className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-text">{cat.name}</h3>
              <p className="mt-1 text-xs text-text-muted">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
