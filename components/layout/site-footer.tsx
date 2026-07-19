"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { SocialIcon, type SocialPlatform } from "@/components/ui/social-icon";
import type { SiteConfig } from "@/lib/site-config";
import type { Category } from "@/lib/types";

const defaultSocialLinks: SocialPlatform[] = ["facebook", "instagram", "twitter", "linkedin"];

const defaultSupportLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/track-order", label: "Track Order" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/help", label: "FAQs" },
  { href: "/about", label: "About Us" },
];

const defaultCompanyLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/products", label: "All Products" },
  { href: "/account/addresses", label: "Bulk Orders" },
  { href: "/contact", label: "Become a Partner" },
];

export function SiteFooter({ siteConfig, categories = [] }: { siteConfig?: SiteConfig; categories?: Category[] }) {
  const settings = siteConfig?.settings ?? {};
  const footerGroups = siteConfig?.footer;
  const phone = settings.phone ?? "+91 12345 67890";
  const email = settings.email ?? "support@printeve.com";
  const address = settings.address ?? "4th Floor, Print House, MG Road, Bengaluru, Karnataka 560001";
  const description = settings.footer_description ?? "Premium custom printing for businesses of every size — business cards, marketing materials, packaging and bulk print runs, produced with precision and delivered on time, every time.";
  const socialLinks = defaultSocialLinks;
  const policyLinks: { label: string; href: string }[] = (() => {
    try { return settings.footer_policy_links ? JSON.parse(settings.footer_policy_links) : []; } catch { return []; }
  })();

  const linkGroups = footerGroups?.length
    ? footerGroups
    : [
        { id: "support", title: "Support", sort_order: 0, links: defaultSupportLinks.map((l, i) => ({ id: String(i), ...l, sort_order: i })) },
        { id: "company", title: "Company", sort_order: 1, links: defaultCompanyLinks.map((l, i) => ({ id: String(i), ...l, sort_order: i })) },
      ];
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl container-px py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Priinteve" width={139} height={36} className="h-8 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              {description}
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-text-muted">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="size-4" /> {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="size-4" /> {email}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0" /> {address}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label={`Priinteve on ${platform}`}
                >
                  <SocialIcon platform={platform} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-text">{group.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text">Categories</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`} className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                      {cat.icon_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.icon_url} alt="" className="size-4 object-contain" />
                      )}
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Priinteve Innovations. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-text-muted">
            {(policyLinks.length > 0 ? policyLinks : [
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-and-conditions" },
              { label: "Contact", href: "/contact" },
            ]).map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
