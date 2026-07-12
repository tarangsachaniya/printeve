import { getSiteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.pages["shipping-policy"];
  return {
    title: page?.meta_title ?? "Shipping Policy — Priinteve",
    description: page?.meta_description ?? undefined,
  };
}

export default async function ShippingPolicyPage() {
  const config = await getSiteConfig();
  const page = config.pages["shipping-policy"];
  const section = page?.sections?.[0];
  const html = (section?.content as Record<string, string> | null)?.html ?? "";

  return (
    <div className="mx-auto max-w-3xl container-px py-14 lg:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
        {page?.title ?? "Shipping Policy"}
      </h1>
      {html ? (
        <div className="mt-8 prose-print" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="mt-8 text-text-muted">This page is being prepared. Please check back soon.</p>
      )}
    </div>
  );
}
