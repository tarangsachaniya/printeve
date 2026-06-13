import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { faqs } from "@/data/content";

export function FaqSection() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-4xl container-px py-16 lg:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            Answers to common questions about ordering, artwork, pricing and delivery.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-8 rounded-lg border border-border bg-background px-6">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className={i === faqs.length - 1 ? "border-b-0" : ""}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
