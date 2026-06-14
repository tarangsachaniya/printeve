"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, ChevronDown, Printer, MapPin, Settings, LogOut, UserCircle, Package } from "lucide-react";
import { useCategories } from "@/lib/category";
import { getCategoryIcon, getCategoryDescription } from "@/data/categories";
import { useAuth } from "@/lib/auth";
import { useCity } from "@/lib/city";
import { AuthModal } from "@/components/auth/auth-modal";
import { AccountModal } from "@/components/auth/account-modal";
import { CartSheet } from "./cart-sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [accountTab, setAccountTab] = React.useState<"profile" | "addresses" | "settings">("profile");
  const { user, logout } = useAuth();
  const { cityName, openPicker } = useCity();
  const { categories } = useCategories();
  const router = useRouter();

  function openAccountModal(tab: "profile" | "addresses" | "settings") {
    setUserMenuOpen(false);
    setAccountTab(tab);
    setAccountOpen(true);
  }

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

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    router.push(`/products${q ? `?search=${encodeURIComponent(String(q))}` : ""}`);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background transition-shadow",
        scrolled && "shadow-[var(--shadow-card)]"
      )}
    >
      {/* Top bar */}
      <div className="hidden border-b border-border bg-surface md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between container-px py-2 text-xs text-text-muted">
          <p>Free design proofing on every order &middot; Pan-India delivery</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openPicker}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="size-3.5" />
              {cityName ?? "Select city"}
            </button>
            <a href="tel:+911234567890" className="hover:text-primary transition-colors">
              +91 12345 67890
            </a>
            <Link href="/track-order" className="hover:text-primary transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 container-px py-3.5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Printer className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-text">PrintEve</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
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
            {megaOpen && (
              <div className="absolute left-0 top-full w-[640px] rounded-lg border border-border bg-background p-5 shadow-[var(--shadow-card-hover)]">
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug);
                    return (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        className="group flex items-start gap-3 rounded-md p-2.5 transition-colors hover:bg-surface"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-primary">
                          {cat.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cat.image_url} alt="" className="size-full object-cover" />
                          ) : (
                            <Icon className="size-4.5" />
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-text group-hover:text-primary">
                            {cat.name}
                          </span>
                          <span className="block text-xs text-text-muted mt-0.5 line-clamp-1">
                            {getCategoryDescription(cat.slug)}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <Link href="/products" className="text-sm font-medium text-primary hover:underline">
                    View all products &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-auto">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              name="q"
              type="search"
              placeholder="Search products..."
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus-ring focus-visible:border-primary focus-visible:bg-background"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto md:ml-0">
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
                <User className="size-5" />
                <span className="hidden sm:inline">{user.fullName.split(" ")[0]}</span>
                <ChevronDown className="size-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full w-56 rounded-lg border border-border bg-background p-1.5 shadow-[var(--shadow-card-hover)]">
                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <Package className="size-4" /> Orders
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => openAccountModal("profile")}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <UserCircle className="size-4" /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => openAccountModal("addresses")}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <MapPin className="size-4" /> Addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => openAccountModal("settings")}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
                  >
                    <Settings className="size-4" /> Settings
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-surface"
                  >
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </div>
              )}
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
          <CartSheet />
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
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search products..."
                  className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus-ring"
                />
              </div>
            </form>
            {categories.length > 0 && (
              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Categories
              </p>
            )}
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
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
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} defaultTab={accountTab} />
    </header>
  );
}
