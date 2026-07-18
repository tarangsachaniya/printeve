"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, ChevronDown, MapPin, ShieldCheck, LogOut, UserCircle, Package, Layers, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCity } from "@/lib/city";
import { useCart } from "@/lib/cart";
import { AuthModal } from "@/components/auth/auth-modal";
import { SearchModal } from "./search-modal";
import { ThemeToggle } from "./theme-toggle";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/lib/site-config";
import type { Category } from "@/lib/types";

const defaultNavLinks = [
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

interface SiteHeaderProps {
  siteConfig?: SiteConfig;
  categories?: Category[];
}

export function SiteHeader({ siteConfig, categories = [] }: SiteHeaderProps) {
  const navLinks = siteConfig?.navbar?.main?.map(n => ({ href: n.href, label: n.label })) ?? defaultNavLinks;
  const topbarMessage = siteConfig?.settings?.topbar_message ?? "Free design proofing on every order · Pan-India delivery";
  const phone = siteConfig?.settings?.phone ?? "+91 12345 67890";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const { cityName, openPicker } = useCity();
  const { itemCount } = useCart();
  const router = useRouter();

  async function handleSignOut() {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background transition-shadow",
        scrolled && "shadow-[var(--shadow-brand)] backdrop-blur-md bg-background/80"
      )}
    >
      {/* Top bar */}
      <div className="hidden border-b border-border bg-surface md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between container-px py-2 text-xs text-text-muted">
          <p>{topbarMessage}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openPicker}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="size-3.5" />
              {cityName ?? "Select city"}
            </button>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
              {phone}
            </a>
            <Link href="/track-order" className="hover:text-primary transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 container-px py-3.5">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Priinteve" width={139} height={36} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {/* Categories mega-menu */}
          {categories.length > 0 && (
            <div
              className="relative"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setMegaOpen(true);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") setMegaOpen(false);
              }}
            >
              <button
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface focus-ring"
                aria-expanded={megaOpen}
                onClick={() => setMegaOpen((v) => !v)}
              >
                Products
                <ChevronDown className="size-4" />
              </button>
              <div
                className={cn(
                  "absolute left-0 top-full w-[640px] origin-top rounded-xl border border-border bg-background p-5 shadow-[var(--shadow-card-hover)] transition-all duration-150",
                  megaOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="flex items-center gap-2 text-sm font-semibold text-text hover:text-primary transition-colors"
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                          {category.icon_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={category.icon_url} alt="" className="size-4 object-contain" />
                          ) : (
                            <Layers className="size-3.5 text-primary" />
                          )}
                        </span>
                        {category.title}
                      </Link>
                      <div className="mt-1.5 ml-9 flex flex-col gap-1">
                        {category.products.slice(0, 3).map((product) => (
                          <Link
                            key={product.slug}
                            href={`/products/${product.slug}`}
                            className="flex items-center gap-2 rounded-md py-1 pr-2 text-xs text-text-muted transition-colors hover:bg-surface hover:text-primary"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface">
                              <ProductImage src={product.images?.[0]} alt={product.name} sizes="40px" />
                            </span>
                            <span className="line-clamp-2">{product.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/products"
                  className="mt-4 flex items-center justify-between rounded-lg bg-[image:var(--gradient-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  onClick={() => setMegaOpen(false)}
                >
                  View all products
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex size-10 items-center justify-center rounded-md text-text transition-colors hover:bg-surface focus-ring"
            aria-label="Search products"
          >
            <Search className="size-5" />
          </button>
          <ThemeToggle />
          {user ? (
            <div
              className="relative"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setUserMenuOpen(true);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") setUserMenuOpen(false);
              }}
            >
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-text transition-colors hover:bg-surface focus-ring"
                aria-expanded={userMenuOpen}
                aria-label="Account menu"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <User className="size-4" />
                </span>
                <span className="hidden sm:inline">{user.fullName.split(" ")[0]}</span>
                <ChevronDown className="size-4" />
              </button>
              <div
                className={cn(
                  "absolute right-0 top-full w-56 origin-top-right rounded-xl border border-border bg-background p-1.5 shadow-[var(--shadow-card-hover)] transition-all duration-150",
                  userMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <Package className="size-4" /> Orders
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/account/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <UserCircle className="size-4" /> Profile
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <MapPin className="size-4" /> Addresses
                  </Link>
                  <Link
                    href="/account/security"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <ShieldCheck className="size-4" /> Security
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-surface"
                  >
                    <LogOut className="size-4" /> Sign Out
                  </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="flex size-10 items-center justify-center rounded-md text-text transition-colors hover:bg-surface focus-ring"
              aria-label="Sign in"
            >
              <User className="size-5" />
            </button>
          )}
          <Link
            href="/cart"
            className="relative flex size-10 items-center justify-center rounded-md text-text transition-colors hover:bg-surface focus-ring"
            aria-label="View cart"
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-[var(--shadow-brand)]">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          <button
            className="flex size-10 items-center justify-center rounded-md text-text transition-colors hover:bg-surface focus-ring lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-px py-4 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-2 flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-text-muted focus-ring"
            >
              <Search className="size-4" />
              Search products...
            </button>
            {categories.length > 0 && (
              <>
                <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Categories
                </p>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface"
                    onClick={() => setMobileOpen(false)}
                  >
                    {category.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.icon_url} alt="" className="size-5 object-contain" />
                    ) : (
                      <Layers className="size-4 text-primary" />
                    )}
                    {category.title}
                  </Link>
                ))}
              </>
            )}
            <div className="mt-2 border-t border-border pt-2 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} categories={categories} />
    </header>
  );
}
