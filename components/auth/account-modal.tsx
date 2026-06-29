"use client";

import * as React from "react";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  UserCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "profile" | "addresses" | "settings";
}

export function AccountModal({
  open,
  onOpenChange,
  defaultTab = "profile",
}: AccountModalProps) {
  const [tab, setTab] = React.useState<"profile" | "addresses" | "settings">(defaultTab);

  // Sync tab when defaultTab changes (e.g. opening from different menu items)
  React.useEffect(() => {
    if (open) setTab(defaultTab);
  }, [defaultTab, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your profile, addresses and preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <UserCircle className="size-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-1.5">
              <MapPin className="size-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings className="size-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="addresses" className="mt-4">
            <AddressesTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Profile Tab ─────────────────────────────────────────────────────────── */

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
}

function ProfileTab() {
  const [form, setForm] = React.useState<ProfileForm>({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .get<Partial<ProfileForm>>("/account/profile")
      .then((data) => {
        setForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Unable to load profile.";
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch("/account/profile", form);
      setSaved(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to save changes. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label className="mb-1.5 block" htmlFor="modal-fullName">Full Name</Label>
        <Input id="modal-fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
      </div>
      <div>
        <Label className="mb-1.5 block" htmlFor="modal-email">Email</Label>
        <Input id="modal-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <Label className="mb-1.5 block" htmlFor="modal-phone">Phone Number</Label>
        <Input id="modal-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
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
  );
}

/* ─── Addresses Tab ───────────────────────────────────────────────────────── */

const EMPTY_FORM: Omit<Address, "id"> = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

function AddressesTab() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Omit<Address, "id">>(EMPTY_FORM);
  const [profileDefaults, setProfileDefaults] = React.useState({ fullName: "", phone: "" });
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    api
      .get<Address[]>("/account/addresses")
      .then(setAddresses)
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Unable to load addresses.";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));

    // Fetch profile to pre-fill fullName & phone on new address
    api
      .get<{ fullName?: string; phone?: string }>("/account/profile")
      .then((data) => setProfileDefaults({ fullName: data.fullName ?? "", phone: data.phone ?? "" }))
      .catch(() => {});
  }, []);

  function update<K extends keyof Omit<Address, "id">>(key: K, value: Address[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAddDialog() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, fullName: profileDefaults.fullName, phone: profileDefaults.phone });
    setOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        const updated = await api.patch<Address>(`/account/addresses/${editingId}`, form);
        setAddresses((prev) => {
          const next = prev.map((a) => (a.id === editingId ? updated : a));
          return form.isDefault ? next.map((a) => (a.id === editingId ? a : { ...a, isDefault: false })) : next;
        });
      } else {
        const created = await api.post<Address>("/account/addresses", form);
        setAddresses((prev) => {
          const next = created.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [...next, created];
        });
      }
      setOpen(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to save address. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeleting(true);
    try {
      await api.delete(`/account/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeleteId(null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to delete address. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSetDefault(id: string) {
    setError(null);
    try {
      await api.patch<Address>(`/account/addresses/${id}`, { isDefault: true });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to update address. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Manage your delivery addresses for faster checkout.</p>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="size-4" /> Add Address
        </Button>
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

      {addresses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface">
            <MapPin className="size-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text">No addresses saved</p>
          <p className="text-xs text-text-muted">Add a delivery address to speed up checkout.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[340px] overflow-y-auto pr-1">
          {addresses.map((address) => (
            <Card key={address.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{address.label}</span>
                  {address.isDefault && <Badge variant="accent">Default</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditDialog(address)} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-primary" aria-label="Edit address">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(address.id)} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger" aria-label="Delete address">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-text">{address.fullName}</p>
              <p className="text-xs text-text-muted">
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
              </p>
              <p className="text-xs text-text-muted">{address.phone}</p>
              {!address.isDefault && (
                <button onClick={() => handleSetDefault(address.id)} className="mt-1 flex items-center gap-1.5 self-start text-xs font-medium text-primary hover:underline">
                  <Star className="size-3" /> Set as default
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Inner dialog for add/edit address */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>Enter the delivery address details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block" htmlFor="addr-label">Label</Label>
                <Input id="addr-label" required value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Home / Office" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="addr-fullName">Full Name</Label>
                <Input id="addr-fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="addr-phone">Phone Number</Label>
                <Input id="addr-phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="addr-line1">Address Line 1</Label>
                <Input id="addr-line1" required value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="Street address" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="addr-line2">Address Line 2 (optional)</Label>
                <Input id="addr-line2" value={form.line2 ?? ""} onChange={(e) => update("line2", e.target.value)} placeholder="Apartment, suite, etc." />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="addr-city">City</Label>
                <Input id="addr-city" required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Mumbai" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="addr-state">State</Label>
                <Input id="addr-state" required value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Maharashtra" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="addr-pincode">Pincode</Label>
                <Input id="addr-pincode" required value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="400001" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="addr-isDefault"
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) => update("isDefault", e.target.checked)}
                  className="size-4 rounded border-border text-primary focus-ring"
                />
                <Label htmlFor="addr-isDefault">Set as default address</Label>
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-2">
              {editingId ? "Save Changes" : "Add Address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete address?"
        description="This address will be permanently removed from your account."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}

/* ─── Settings Tab ────────────────────────────────────────────────────────── */

function SettingsTab() {
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
      const msg = err instanceof ApiError ? err.message : "Unable to update password. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change Password */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block" htmlFor="modal-currentPassword">Current Password</Label>
            <PasswordInput id="modal-currentPassword" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block" htmlFor="modal-newPassword">New Password</Label>
              <PasswordInput id="modal-newPassword" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="modal-confirmPassword">Confirm Password</Label>
              <PasswordInput id="modal-confirmPassword" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
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
      </div>

      {/* Notification Preferences */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Notification Preferences</h3>
        <div className="flex flex-col gap-2">
          {[
            { key: "orderUpdates" as const, label: "Order updates", description: "Status changes, shipping and delivery notifications" },
            { key: "promotions" as const, label: "Promotions & offers", description: "Discounts, sales and seasonal offers" },
            { key: "productAnnouncements" as const, label: "Product announcements", description: "New products and feature updates" },
          ].map((item) => (
            <label key={item.key} className="flex items-start justify-between gap-4 rounded-md border border-border p-3 cursor-pointer hover:bg-surface transition-colors">
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
      </div>
    </div>
  );
}
