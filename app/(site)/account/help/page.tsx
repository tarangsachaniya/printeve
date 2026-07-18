import Link from "next/link";
import { Mail, Phone, ScrollText, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { getSiteConfig, getPageSections } from "@/lib/site-config";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";

const POLICY_LINKS = [
  { href: "/terms-and-conditions", label: "Terms & Conditions", icon: ScrollText },
  { href: "/privacy-policy", label: "Privacy Policy", icon: ShieldCheck },
  { href: "/shipping-policy", label: "Shipping Policy", icon: Truck },
  { href: "/refund-policy", label: "Refund Policy", icon: RotateCcw },
];

export default async function HelpPage() {
  const config = await getSiteConfig();
  const s = getPageSections(config.pages.home);
  const faqs = (s.faq?.items ?? []).map((item) => ({ question: item.title ?? "", answer: item.content ?? "" }));

  const phone = config.settings?.phone ?? "+91 12345 67890";
  const email = config.settings?.email ?? "support@printeve.com";

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Help & Support" description="Answers to common questions, and ways to reach us." />

      <SettingsSection title="Talk to us" description="We usually reply within a few hours.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Call us</p>
                <p className="text-xs text-text-muted">{phone}</p>
              </div>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Email us</p>
                <p className="text-xs text-text-muted">{email}</p>
              </div>
            </a>
          )}
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </SettingsSection>

      {faqs.length > 0 && (
        <SettingsSection title="Frequently asked questions">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className={i === faqs.length - 1 ? "border-b-0" : ""}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SettingsSection>
      )}

      <SettingsSection title="Policies">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {POLICY_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted">
                  <Icon className="size-4" />
                </div>
                <p className="text-sm font-medium text-text">{link.label}</p>
              </Link>
            );
          })}
        </div>
      </SettingsSection>
    </div>
  );
}
