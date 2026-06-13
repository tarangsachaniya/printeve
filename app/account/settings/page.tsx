"use client";

import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [notifications, setNotifications] = React.useState({
    orderUpdates: true,
    promotions: false,
    productAnnouncements: true,
  });

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.patch("/account/profile", { currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update the password used to sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="flex max-w-md flex-col gap-4">
            <div>
              <Label className="mb-1.5 block" htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Update Password"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-accent">
                  <CheckCircle2 className="size-4" /> Updated
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what updates you want to receive by email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-md flex-col gap-4">
            {[
              { key: "orderUpdates" as const, label: "Order updates", description: "Status changes, shipping and delivery notifications" },
              { key: "promotions" as const, label: "Promotions & offers", description: "Discounts, sales and seasonal offers" },
              { key: "productAnnouncements" as const, label: "Product announcements", description: "New products and feature updates" },
            ].map((item) => (
              <label key={item.key} className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() => toggleNotification(item.key)}
                  className="mt-1 size-4 shrink-0 rounded border-border text-primary focus-ring"
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
