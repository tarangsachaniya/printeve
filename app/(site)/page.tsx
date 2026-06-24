import { getSiteConfig, getPageSections } from "@/lib/site-config";
import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const config = await getSiteConfig();
  const s = getPageSections(config.pages.home);

  return (
    <>
      {s.hero && <Hero section={s.hero} />}
      <CategoriesSection />
      <FeaturedProducts />
      {s['why-choose-us'] && <WhyChooseUs section={s['why-choose-us']} />}
      {s['how-it-works'] && <HowItWorks section={s['how-it-works']} />}
      {s.testimonials && <Testimonials section={s.testimonials} />}
      {s.faq && <FaqSection section={s.faq} />}
      {s.cta && <CtaSection section={s.cta} />}
    </>
  );
}
