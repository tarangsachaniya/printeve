"use client";

import * as React from "react";
import { Package, Megaphone, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { NotificationToggle } from "@/components/account/notification-toggle";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";

interface Prefs {
  orderNotifications: boolean;
  promotionalNotifications: boolean;
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = React.useState<Prefs | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<keyof Prefs | null>(null);

  React.useEffect(() => {
    api
      .get<Partial<Prefs>>("/account/profile")
      .then((data) =>
        setPrefs({
          orderNotifications: data.orderNotifications ?? true,
          promotionalNotifications: data.promotionalNotifications ?? false,
        })
      )
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Unable to load notification preferences."))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key: keyof Prefs, next: boolean) {
    if (!prefs) return;
    const previous = prefs[key];
    // Optimistic: flip immediately, roll back only if the save fails.
    setPrefs({ ...prefs, [key]: next });
    setBusyKey(key);
    try {
      await api.patch("/account/profile", { [key]: next });
    } catch (err) {
      setPrefs((prev) => (prev ? { ...prev, [key]: previous } : prev));
      toast.error(err instanceof ApiError ? err.message : "Unable to save. Please try again.");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading || !prefs) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Notifications" description="Choose what we tell you about, and how." />

      <SettingsSection title="Delivered by email" description="Sent to the email address on your profile.">
        <div className="flex flex-col gap-3">
          <NotificationToggle
            icon={Package}
            label="Order updates"
            description="Confirmation, printing, dispatch and delivery status."
            checked={prefs.orderNotifications}
            busy={busyKey === "orderNotifications"}
            onCheckedChange={(v) => toggle("orderNotifications", v)}
          />
          <NotificationToggle
            icon={Megaphone}
            label="Promotions & offers"
            description="Discounts, new products and seasonal sales."
            checked={prefs.promotionalNotifications}
            busy={busyKey === "promotionalNotifications"}
            onCheckedChange={(v) => toggle("promotionalNotifications", v)}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Other channels">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 opacity-70">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted">
                <Smartphone className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Push notifications</p>
                <p className="text-xs text-text-muted">Coming soon — for now, order and promo updates arrive by email.</p>
              </div>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} disabled aria-label="Push notifications (coming soon)" />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Account security alerts</p>
                <p className="text-xs text-text-muted">Password changes and account deletion. Always on to keep your account safe.</p>
              </div>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} disabled aria-label="Account security alerts (always on)" />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
