"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Lock, Package, MapPin, Palette, User, Settings } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/icon-chip";
import { AuthModal } from "@/components/auth/auth-modal";

const NAV_ITEMS = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/designs", label: "Saved Designs", icon: Palette },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<"loading" | "authed" | "guest">("loading");
  const [authOpen, setAuthOpen] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    api
      .get("/account/profile")
      .then(() => setStatus("authed"))
      .catch((err) => setStatus(err instanceof ApiError && err.status === 401 ? "guest" : "authed"));
  }, []);

  React.useEffect(() => {
    if (user && status === "guest") setStatus("authed");
  }, [user, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (status === "guest") {
    return (
      <div className="mx-auto max-w-md container-px py-24 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface">
          <Lock className="size-6 text-text-muted" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-text">Sign in to view your account</h1>
        <p className="mt-2 text-sm text-text-muted">
          Access your orders, addresses and account settings.
        </p>
        <Button size="lg" className="mt-6" onClick={() => setAuthOpen(true)}>
          Sign In
        </Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return <AccountShell>{children}</AccountShell>;
}

function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl container-px py-10 lg:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="h-fit overflow-hidden rounded-2xl border border-border bg-background divide-y divide-border">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/5 text-primary" : "text-text hover:bg-surface"
                )}
              >
                <IconChip size="sm" className={cn(!isActive && "bg-surface text-text-muted")}>
                  <Icon className="size-4" />
                </IconChip>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
