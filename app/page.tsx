import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
      <CtaSection />
    </>
  );
}
