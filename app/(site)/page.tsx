import { cookies } from "next/headers";
import { Fragment, type ReactNode } from "react";
import { getSiteConfig, getPageSections } from "@/lib/site-config";
import { getHomepage } from "@/lib/homepage";
import { Hero } from "@/components/home/hero";
import { StoriesRail } from "@/components/home/stories-rail";
import { CategoriesSection } from "@/components/home/categories-section";
import { LatestProductsRail } from "@/components/home/latest-products-rail";
import { PopularProductsRail } from "@/components/home/popular-products-rail";
import { CouponBanner } from "@/components/home/coupon-banner";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";
import type { HomepageData } from "@/lib/types";

const DYNAMIC_SECTION_RENDERERS: Record<string, (homepage: HomepageData, settings: Record<string, unknown>) => ReactNode> = {
  stories: (homepage) => <StoriesRail stories={homepage.stories} />,
  categories: (homepage, settings) => (
    <CategoriesSection categories={homepage.categories} displayStyle={settings.display_style === "scroll" ? "scroll" : "grid"} />
  ),
  latest_products: (homepage) => <LatestProductsRail products={homepage.latest_products} />,
  popular_products: (homepage) => <PopularProductsRail products={homepage.popular_products} />,
};

export default async function HomePage() {
  const cityId = (await cookies()).get("printeve_city_id")?.value;

  // One homepage API call for the whole page — same backend service the app uses.
  const [config, homepage] = await Promise.all([getSiteConfig(), getHomepage(cityId)]);
  const s = getPageSections(config.pages.home);

  // Admin-orderable homepage sections (Stories/Categories/Latest/Popular) — driven by
  // the homepage_sections registry, all sourced from the single getHomepage() call above.
  // CMS-page sections below (Hero, WhyChooseUs, etc.) are a separate mechanism and keep
  // their historical fixed slots.
  const dynamicSections = homepage.sections
    .filter((section) => DYNAMIC_SECTION_RENDERERS[section.key])
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {s.hero && <Hero section={s.hero} />}
      <CouponBanner coupons={homepage.coupons} />
      {dynamicSections.map((section) => (
        <Fragment key={section.key}>{DYNAMIC_SECTION_RENDERERS[section.key](homepage, section.settings)}</Fragment>
      ))}
      {s["why-choose-us"] && <WhyChooseUs section={s["why-choose-us"]} />}
      {s["how-it-works"] && <HowItWorks section={s["how-it-works"]} />}
      {s.testimonials && <Testimonials section={s.testimonials} />}
      {s.faq && <FaqSection section={s.faq} />}
      {s.cta && <CtaSection section={s.cta} />}
    </>
  );
}
