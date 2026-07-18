"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Palette,
  User,
  Bell,
  ShieldCheck,
  SlidersHorizontal,
  HelpCircle,
  Info,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { IconChip } from "@/components/ui/icon-chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Account",
    items: [
      { href: "/account/orders", label: "Orders", icon: Package },
      { href: "/account/addresses", label: "Addresses", icon: MapPin },
      { href: "/account/designs", label: "Saved Designs", icon: Palette },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/account/profile", label: "Profile", icon: User },
      { href: "/account/notifications", label: "Notifications", icon: Bell },
      { href: "/account/security", label: "Privacy & Security", icon: ShieldCheck },
      { href: "/account/preferences", label: "Preferences", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/account/help", label: "Help & Support", icon: HelpCircle },
      { href: "/account/about", label: "About", icon: Info },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function isActiveHref(pathname: string | null, href: string) {
  return pathname === href || !!pathname?.startsWith(href + "/");
}

export function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch {
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  return (
    <>
      {/* Desktop / tablet: sticky vertical sidebar */}
      <nav className="hidden h-fit shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:flex lg:w-60">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActiveHref(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-primary/5 text-primary" : "text-text hover:bg-surface"
                  )}
                >
                  <IconChip size="sm" className={cn(!active && "bg-surface text-text-muted")}>
                    <Icon className="size-4" />
                  </IconChip>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <button
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/5"
        >
          <IconChip size="sm" className="bg-danger/10 text-danger">
            <LogOut className="size-4" />
          </IconChip>
          Log Out
        </button>
      </nav>

      {/* Mobile / small tablet: horizontal scrollable tab strip */}
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden" aria-label="Account sections">
        {ALL_ITEMS.map((item) => {
          const active = isActiveHref(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-text-muted hover:text-text"
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-danger"
        >
          <LogOut className="size-3.5" />
          Log Out
        </button>
      </nav>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Log Out"
        loading={loggingOut}
        onConfirm={handleLogout}
      />
    </>
  );
}
