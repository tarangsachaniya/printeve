"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FAQ, Specification } from "@/lib/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface ProductTabsProps {
  description: string | null;
  faqs: FAQ[];
  finishAndCare: string[];
  specifications: Specification[];
}

const ALL_TABS = ["Specifications", "FAQs", "Finish & Care"] as const;
type Tab = (typeof ALL_TABS)[number];

export function ProductTabs({ description, faqs, finishAndCare, specifications }: ProductTabsProps) {
  const tabs = ALL_TABS.filter((tab) => {
    if (tab === "Specifications") return specifications.length > 0 || !!description;
    if (tab === "FAQs") return faqs.length > 0;
    if (tab === "Finish & Care") return finishAndCare.length > 0;
    return false;
  });

  const [active, setActive] = useState<Tab>(tabs[0] ?? "Specifications");

  if (tabs.length === 0) return null;

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "px-5 py-3 text-sm font-medium transition-colors relative",
              active === tab
                ? "text-primary"
                : "text-text-muted hover:text-text"
            )}
          >
            {tab}
            {active === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div className="py-6">
        {active === "Specifications" && (
          specifications.length > 0 ? (
            <div className="flex flex-col">
              {specifications.map((spec, i) => (
                <div key={i} className="flex gap-2 py-2 border-b border-border/50">
                  <span className="w-1/4 shrink-0 text-sm text-text-muted">{spec.key}</span>
                  <span className="w-3/4 text-sm font-medium text-text">{spec.value || "—"}</span>
                </div>
              ))}
            </div>
          ) : description ? (
            <div className="prose-print max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <p className="text-sm text-text-muted">No specifications available for this product.</p>
          )
        )}

        {active === "FAQs" && (
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className={i === faqs.length - 1 ? "border-b-0" : ""}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {active === "Finish & Care" && (
          <ul className="space-y-2">
            {finishAndCare.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
