"use client";

import * as React from "react";
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

export default function AddressesPage() {
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
      .catch((err) => setError(err instanceof ApiError ? err.message : "Unable to load addresses."))
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
      setError(err instanceof ApiError ? err.message : "Unable to save address. Please try again.");
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
      setError(err instanceof ApiError ? err.message : "Unable to delete address. Please try again.");
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
      setError(err instanceof ApiError ? err.message : "Unable to update address. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Saved Addresses</h2>
          <p className="text-sm text-text-muted">Manage your delivery addresses for faster checkout.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="size-4" /> Add Address
        </Button>
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

      {addresses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface">
            <MapPin className="size-6 text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text">No addresses saved</h3>
          <p className="max-w-sm text-sm text-text-muted">
            Add a delivery address to speed up checkout next time.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{address.label}</span>
                  {address.isDefault && <Badge variant="accent">Default</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditDialog(address)} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-primary" aria-label="Edit address">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => setDeleteId(address.id)} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger" aria-label="Delete address">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-text">{address.fullName}</p>
              <p className="text-sm text-text-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
              </p>
              <p className="text-sm text-text-muted">{address.phone}</p>
              {!address.isDefault && (
                <button onClick={() => handleSetDefault(address.id)} className="mt-1 flex items-center gap-1.5 self-start text-xs font-medium text-primary hover:underline">
                  <Star className="size-3.5" /> Set as default
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>Enter the delivery address details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block" htmlFor="label">Label</Label>
                <Input id="label" required value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Home / Office" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="phone">Phone Number</Label>
                <Input id="phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="line1">Address Line 1</Label>
                <Input id="line1" required value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="Street address" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="line2">Address Line 2 (optional)</Label>
                <Input id="line2" value={form.line2 ?? ""} onChange={(e) => update("line2", e.target.value)} placeholder="Apartment, suite, etc." />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Mumbai" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="state">State</Label>
                <Input id="state" required value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Maharashtra" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="pincode">Pincode</Label>
                <Input id="pincode" required value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="400001" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={(e) => update("isDefault", e.target.checked)}
                  className="size-4 rounded border-border text-primary focus-ring"
                />
                <Label htmlFor="isDefault">Set as default address</Label>
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
