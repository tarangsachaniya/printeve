import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { CmsSection } from "@/lib/site-config";

export function FaqSection({ section }: { section: CmsSection }) {
  const items = (section.items ?? []).map((item) => ({
    question: item.title ?? "",
    answer: item.content ?? "",
  }));

  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-4xl container-px py-16 lg:py-20">
        <div className="text-center">
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

        <Accordion type="single" collapsible className="mt-8 rounded-lg border border-border bg-background px-6">
          {items.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className={i === items.length - 1 ? "border-b-0" : ""}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
