import Link from "next/link";
import { Printer, Mail, Phone, MapPin } from "lucide-react";
import { categories } from "@/data/categories";
import { SocialIcon, type SocialPlatform } from "@/components/ui/social-icon";

const socialLinks: SocialPlatform[] = ["facebook", "instagram", "twitter", "linkedin"];

const supportLinks = [
  { href: "/contact", label: "Contact Us" },
  { href: "/track-order", label: "Track Order" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/faq", label: "FAQs" },
  { href: "/about", label: "About Us" },
];

const companyLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/products", label: "All Products" },
  { href: "/account/addresses", label: "Bulk Orders" },
  { href: "/contact", label: "Become a Partner" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl container-px py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Printer className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-text">PrintEve</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
              Premium custom printing for businesses of every size — business cards, marketing
              materials, packaging and bulk print runs, produced with precision and delivered on
              time, every time.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-text-muted">
              <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="size-4" /> +91 12345 67890
              </a>
              <a href="mailto:support@printeve.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="size-4" /> support@printeve.com
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0" /> 4th Floor, Print House, MG Road,
                Bengaluru, Karnataka 560001
              </p>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label={`PrintEve on ${platform}`}
                >
                  <SocialIcon platform={platform} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">Products</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">Support</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">Company</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} PrintEve. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
