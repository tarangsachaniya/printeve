"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Laptop2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Privacy & Security" description="Manage your password and account safety." />
      <PasswordSection />
      <SessionsSection />
      <DangerZone />
    </div>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch("/account/profile", { currentPassword, newPassword });
      setSaved(true);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to update password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection title="Password" description="Use a strong password you don't use anywhere else.">
      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
        <div>
          <Label className="mb-1.5 block" htmlFor="currentPassword">Current Password</Label>
          <PasswordInput id="currentPassword" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block" htmlFor="newPassword">New Password</Label>
          <PasswordInput id="newPassword" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <p className="mt-1 text-xs text-text-muted">Minimum 8 characters.</p>
        </div>
        <div>
          <Label className="mb-1.5 block" htmlFor="confirmPassword">Confirm New Password</Label>
          <PasswordInput id="confirmPassword" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Update Password"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle2 className="size-4" /> Updated
            </span>
          )}
        </div>
      </form>
    </SettingsSection>
  );
}

function SessionsSection() {
  return (
    <SettingsSection title="Sessions & devices" description="Where you're signed in.">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Laptop2 className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text">This device</p>
          <p className="text-xs text-text-muted">
            Per-device session management and login history aren&apos;t available yet — signing out below ends this browser&apos;s session.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}

function DangerZone() {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setError(null);
    try {
      await api.delete("/account", { password });
      toast.success("Your account has been deleted.");
      await logout().catch(() => {});
      router.push("/");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to delete your account. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SettingsSection
      title="Danger zone"
      description="Permanently delete your account."
      className="border-danger/20"
    >
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-danger/20 bg-danger/5 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-medium text-text">Delete account</p>
            <p className="text-xs text-text-muted">
              Your profile, saved addresses and login access are removed. Order history is kept for invoicing records.
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => setOpen(true)} className="shrink-0">
          Delete Account
        </Button>
      </div>

      <ResponsiveDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPassword(""); setError(null); } }}>
        <ResponsiveDialogContent size="md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete your account?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              This can&apos;t be undone. Enter your password to confirm.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form onSubmit={handleDelete} className="mt-2 flex flex-col gap-4">
            <div>
              <Label className="mb-1.5 block" htmlFor="delete-password">Password</Label>
              <PasswordInput id="delete-password" required value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </div>
            {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={deleting || !password}>
                {deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete My Account"}
              </Button>
            </div>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </SettingsSection>
  );
}
