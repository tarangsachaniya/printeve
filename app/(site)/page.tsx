import { Fragment, type ReactNode } from "react";
import { getSiteConfig, getPageSections, getHomepageSections } from "@/lib/site-config";
import { Hero } from "@/components/home/hero";
import { StoriesRail } from "@/components/home/stories-rail";
import { CategoriesSection } from "@/components/home/categories-section";
import { RecommendedRail } from "@/components/home/recommended-rail";
import { FeaturedRail } from "@/components/home/featured-rail";
import { LatestCouponsRail } from "@/components/home/latest-coupons-rail";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

const DYNAMIC_SECTION_RENDERERS: Record<string, (settings: Record<string, unknown>) => ReactNode> = {
  stories: () => <StoriesRail />,
  categories: (settings) => (
    <CategoriesSection displayStyle={settings.display_style === "scroll" ? "scroll" : "grid"} />
  ),
  recommended: () => <RecommendedRail />,
  featured: () => <FeaturedRail />,
  latest_coupons: (settings) => (
    <LatestCouponsRail limit={typeof settings.limit === "number" ? settings.limit : 10} />
  ),
};

export default async function HomePage() {
  const config = await getSiteConfig();
  const s = getPageSections(config.pages.home);
  const homepageSections = getHomepageSections(config);

  // Admin-orderable homepage sections (Stories/Categories/Recommended/Featured) — driven by
  // the homepage_sections registry. CMS-page sections below (Hero, WhyChooseUs, etc.) are a
  // separate mechanism and keep their historical fixed slots.
  const dynamicSections = Object.values(homepageSections)
    .filter((section) => section.is_active && DYNAMIC_SECTION_RENDERERS[section.key])
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {s.hero && <Hero section={s.hero} />}
      {dynamicSections.map((section) => (
        <Fragment key={section.key}>{DYNAMIC_SECTION_RENDERERS[section.key](section.settings)}</Fragment>
      ))}
      {s["why-choose-us"] && <WhyChooseUs section={s["why-choose-us"]} />}
      {s["how-it-works"] && <HowItWorks section={s["how-it-works"]} />}
      {s.testimonials && <Testimonials section={s.testimonials} />}
      {s.faq && <FaqSection section={s.faq} />}
      {s.cta && <CtaSection section={s.cta} />}
    </>
  );
}
