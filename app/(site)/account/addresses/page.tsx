"use client";

import * as React from "react";
import { Plus, MapPin, Pencil, Trash2, Star, Loader2, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { isValidIndianPhone } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  houseNumber: "",
  floor: "",
  towerBlock: "",
  landmark: "",
  mapsLink: "",
  latitude: null,
  longitude: null,
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
  const [locating, setLocating] = React.useState(false);

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
      houseNumber: address.houseNumber ?? "",
      floor: address.floor ?? "",
      towerBlock: address.towerBlock ?? "",
      landmark: address.landmark ?? "",
      mapsLink: address.mapsLink ?? "",
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
    });
    setOpen(true);
  }

  function captureLocation() {
    if (!("geolocation" in navigator)) {
      setError("Location is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("latitude", Number(pos.coords.latitude.toFixed(6)));
        update("longitude", Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => {
        setError("Unable to get your location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianPhone(form.phone)) {
      const msg = "Please enter a valid 10-digit mobile number.";
      setError(msg);
      toast.error(msg);
      return;
    }
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1.5 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
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
            <Card key={address.id} className="flex flex-col gap-2 rounded-2xl p-4">
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
                <Label className="mb-1.5 block" htmlFor="houseNumber">House / Flat No. (optional)</Label>
                <Input id="houseNumber" value={form.houseNumber ?? ""} onChange={(e) => update("houseNumber", e.target.value)} placeholder="e.g. B-403" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="floor">Floor (optional)</Label>
                <Input id="floor" value={form.floor ?? ""} onChange={(e) => update("floor", e.target.value)} placeholder="e.g. 4th floor" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="towerBlock">Tower / Block (optional)</Label>
                <Input id="towerBlock" value={form.towerBlock ?? ""} onChange={(e) => update("towerBlock", e.target.value)} placeholder="e.g. B block" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="landmark">Nearby Landmark (optional)</Label>
                <Input id="landmark" value={form.landmark ?? ""} onChange={(e) => update("landmark", e.target.value)} placeholder="e.g. Near Felicia" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="mapsLink">Google Maps Link (optional)</Label>
                <Input id="mapsLink" value={form.mapsLink ?? ""} onChange={(e) => update("mapsLink", e.target.value)} placeholder="Paste a Google Maps link" />
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

              <div className="sm:col-span-2 flex flex-col gap-2 rounded-md border border-border bg-surface/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text">Delivery location</p>
                    <p className="text-xs text-text-muted">
                      Helps us route your order to the nearest printer.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={locating}>
                    {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                    {locating ? "Locating…" : "Use my location"}
                  </Button>
                </div>
                {form.latitude != null && form.longitude != null ? (
                  <p className="text-xs font-medium text-primary">
                    Location set ({form.latitude.toFixed(5)}, {form.longitude.toFixed(5)})
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">No location set yet.</p>
                )}
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
