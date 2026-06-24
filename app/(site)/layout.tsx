import { getSiteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, categories] = await Promise.all([
    getSiteConfig(),
    api.get<{ items: Category[] }>("/categories").then(r => r.items ?? []).catch(() => []),
  ]);

  return (
    <>
      <SiteHeader siteConfig={config} categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter siteConfig={config} categories={categories} />
    </>
  );
}
