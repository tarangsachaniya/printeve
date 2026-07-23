import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, Layers, CreditCard, FileText, BookOpen,
  ImageIcon, Flag, Sticker, Package, Megaphone, Printer,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "business-cards": CreditCard,
  "flyers": FileText,
  "brochures": BookOpen,
  "posters": ImageIcon,
  "banners": Flag,
  "stickers": Sticker,
  "packaging-prints": Package,
  "marketing-materials": Megaphone,
  "bulk-printing": Printer,
};

async function getCategories(): Promise<Category[]> {
  try {
    const res = await api.get<{ items: Category[] }>("/categories");
    return res.items ?? [];
  } catch {
    return [];
  }
}

function CategoryCard({ category, className }: { category: Category; className?: string }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group flex flex-col rounded-lg border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/30 ${className ?? ""}`}
    >
      {category.image_url ? (
        <div className="relative -m-6 mb-4 aspect-[16/9] w-[calc(100%+3rem)] overflow-hidden rounded-t-lg bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={category.image_url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
          {category.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.icon_url}
              alt=""
              className="size-7 object-contain"
            />
          ) : (() => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Layers;
            return <Icon className="size-6 text-primary" />;
          })()}
        </div>
        <ArrowRight className="size-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text">
        {category.title}
      </h3>

      {category.short_description && (
        <p className="mt-1 text-sm text-text-muted">
          {category.short_description}
        </p>
      )}

      {category.products.length > 0 && (
        <p className="mt-3 text-xs font-medium text-primary line-clamp-1">
          {category.products
            .slice(0, 4)
            .map((p) => p.name)
            .join(" • ")}
        </p>
      )}
    </Link>
  );
}

export async function CategoriesSection({ displayStyle = "grid" }: { displayStyle?: "grid" | "scroll" }) {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl container-px py-16 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Shop by Category
        </h2>
        <p className="mt-2 text-sm text-text-muted sm:text-base">
          Browse our full range of professional print products.
        </p>
      </div>

      {displayStyle === "scroll" ? (
        <div className="mt-10 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} className="w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
