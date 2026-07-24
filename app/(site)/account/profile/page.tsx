"use client";

import * as React from "react";
import { Loader2, CheckCircle2, Building2, FileText } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isValidEmail, isValidIndianPhone } from "@/lib/utils";
import { GST_NUMBER_REGEX } from "@/lib/gst";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  gstNumber: string;
  avatarUrl: string | null;
}

const EMPTY: ProfileForm = { fullName: "", email: "", phone: "", company: "", gstNumber: "", avatarUrl: null };

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [form, setForm] = React.useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .get<Partial<ProfileForm>>("/account/profile")
      .then((data) => {
        setForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          company: data.company ?? "",
          gstNumber: data.gstNumber ?? "",
          avatarUrl: data.avatarUrl ?? null,
        });
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Unable to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleAvatarUploaded(url: string) {
    // Optimistic: photo already lives on Cloudinary, so persist immediately
    // rather than waiting on the rest of the form's Save button.
    update("avatarUrl", url);
    updateUser({ avatarUrl: url });
    api.patch("/account/profile", { avatarUrl: url }).catch(() => {
      toast.error("Photo uploaded, but saving it to your profile failed. Try Save below.");
    });
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidIndianPhone(form.phone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (form.gstNumber && !GST_NUMBER_REGEX.test(form.gstNumber.toUpperCase())) {
      next.gstNumber = "Format looks off — e.g. 29ABCDE1234F1Z5.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSaving(true);
    const patch = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || null,
      gstNumber: form.gstNumber.trim() ? form.gstNumber.trim().toUpperCase() : null,
    };
    try {
      await api.patch("/account/profile", patch);
      updateUser({ fullName: patch.fullName, email: patch.email, phone: patch.phone, company: patch.company, gstNumber: patch.gstNumber });
      setSaved(true);
      toast.success("Profile updated");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to save changes. Please try again.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-32" />
        <div className="flex items-center gap-5">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-11 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Profile" description="This is how you appear across Priinteve, and how we reach you about your orders." />

      <SettingsSection title="Photo" description="A clear photo helps our team and delivery partners recognize your orders.">
        <div className="flex items-center gap-5">
          <AvatarUpload name={form.fullName || "Your name"} avatarUrl={form.avatarUrl} onUploaded={handleAvatarUploaded} />
          <div className="text-sm text-text-muted">
            <p>JPG or PNG, up to 5MB.</p>
            <p>Click the photo to change it.</p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Personal details" description="Update your name, email and phone number.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block" htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="98765 43210" aria-invalid={!!errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block" htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-5">
            <Building2 className="size-4 text-text-muted" />
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Business details (optional)</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block" htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Studio" />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={form.gstNumber}
                onChange={(e) => update("gstNumber", e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                className="uppercase"
                aria-invalid={!!errors.gstNumber}
              />
              {errors.gstNumber ? (
                <p className="mt-1 text-xs text-danger">{errors.gstNumber}</p>
              ) : (
                <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                  <FileText className="size-3" /> Used on your invoices for bulk/business orders.
                </p>
              )}
            </div>
          </div>

          {formError && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{formError}</p>}

          <div className="flex items-center gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-primary">
                <CheckCircle2 className="size-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </SettingsSection>
    </div>
  );
}
