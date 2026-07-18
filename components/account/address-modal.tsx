"use client";

import * as React from "react";
import { Loader2, User, Users } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { isValidIndianPhone } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AddressLabelPicker } from "@/components/account/address-label-picker";
import { LocationSearch } from "@/components/account/location-search";
import { MapPicker } from "@/components/account/map-picker";
import type { ResolvedLocation } from "@/lib/use-current-location";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";

export type AddressFormValues = Omit<Address, "id">;

const EMPTY_FORM: AddressFormValues = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
  isSelf: true,
  houseNumber: "",
  floor: "",
  towerBlock: "",
  landmark: "",
  mapsLink: "",
  notes: "",
  latitude: null,
  longitude: null,
};

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Address | null;
  profileDefaults: { fullName: string; phone: string };
  existingAddresses: Address[];
  onSaved: (address: Address, wasEditing: boolean) => void;
}

export function AddressModal({ open, onOpenChange, editing, profileDefaults, existingAddresses, onSaved }: AddressModalProps) {
  const [form, setForm] = React.useState<AddressFormValues>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof AddressFormValues, string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        label: editing.label,
        fullName: editing.fullName,
        phone: editing.phone,
        line1: editing.line1,
        line2: editing.line2 ?? "",
        city: editing.city,
        state: editing.state,
        pincode: editing.pincode,
        isDefault: editing.isDefault ?? false,
        isSelf: editing.isSelf ?? false,
        houseNumber: editing.houseNumber ?? "",
        floor: editing.floor ?? "",
        towerBlock: editing.towerBlock ?? "",
        landmark: editing.landmark ?? "",
        mapsLink: editing.mapsLink ?? "",
        notes: editing.notes ?? "",
        latitude: editing.latitude ?? null,
        longitude: editing.longitude ?? null,
      });
    } else {
      setForm({ ...EMPTY_FORM, fullName: profileDefaults.fullName, phone: profileDefaults.phone });
    }
    setErrors({});
    setFormError(null);
  }, [open, editing, profileDefaults]);

  function update<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleLocationResolved(loc: ResolvedLocation) {
    setForm((prev) => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      line1: loc.line1 || prev.line1,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      pincode: loc.pincode || prev.pincode,
    }));
  }

  function toggleIsSelf(next: boolean) {
    update("isSelf", next);
    if (next) {
      setForm((prev) => ({ ...prev, fullName: profileDefaults.fullName, phone: profileDefaults.phone }));
    }
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.label.trim()) next.label = "Choose or name a label.";
    if (!form.fullName.trim()) next.fullName = "Receiver name is required.";
    if (!isValidIndianPhone(form.phone)) next.phone = "Enter a valid 10-digit mobile number.";
    if (!form.houseNumber?.trim()) next.houseNumber = "Required.";
    if (!form.line1.trim()) next.line1 = "Area / street is required.";
    if (!form.city.trim()) next.city = "Required.";
    if (!form.state.trim()) next.state = "Required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = "Enter a valid 6-digit pincode.";
    if (form.latitude == null || form.longitude == null) {
      next.line1 = next.line1 ?? "Set the exact location on the map above.";
    }

    const duplicate = existingAddresses.some(
      (a) =>
        a.id !== editing?.id &&
        a.pincode === form.pincode.trim() &&
        a.line1.trim().toLowerCase() === form.line1.trim().toLowerCase() &&
        (a.houseNumber ?? "").trim().toLowerCase() === (form.houseNumber ?? "").trim().toLowerCase()
    );
    if (duplicate) next.line1 = "You already have an address that looks like this one.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSaving(true);
    const payload = { ...form, line2: form.line2 || undefined };
    try {
      if (editing) {
        const updated = await api.patch<Address>(`/account/addresses/${editing.id}`, payload);
        onSaved(updated, true);
      } else {
        const created = await api.post<Address>("/account/addresses", payload);
        onSaved(created, false);
      }
      toast.success(editing ? "Address updated" : "Address added");
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to save this address. Please try again.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <ResponsiveDialogContent size="lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{editing ? "Edit Address" : "Add Address"}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>Search, drag the pin, or fill in the details manually.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <LocationSearch onSelect={handleLocationResolved} />
            <MapPicker latitude={form.latitude ?? null} longitude={form.longitude ?? null} onResolved={handleLocationResolved} />
          </div>

          <div className="flex rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => toggleIsSelf(true)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
                form.isSelf ? "bg-background text-text shadow-sm" : "text-text-muted"
              )}
            >
              <User className="size-3.5" /> For myself
            </button>
            <button
              type="button"
              onClick={() => toggleIsSelf(false)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
                !form.isSelf ? "bg-background text-text shadow-sm" : "text-text-muted"
              )}
            >
              <Users className="size-3.5" /> Someone else
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-fullName">Receiver Name</Label>
              <Input id="addr-fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-phone">Receiver Phone</Label>
              <Input id="addr-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="98765 43210" aria-invalid={!!errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">Address Label</Label>
            <AddressLabelPicker value={form.label} onChange={(v) => update("label", v)} />
            {errors.label && <p className="mt-1 text-xs text-danger">{errors.label}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-houseNumber">House / Flat No.</Label>
              <Input id="addr-houseNumber" value={form.houseNumber ?? ""} onChange={(e) => update("houseNumber", e.target.value)} placeholder="e.g. B-403" aria-invalid={!!errors.houseNumber} />
              {errors.houseNumber && <p className="mt-1 text-xs text-danger">{errors.houseNumber}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-floor">Apartment / Building Name</Label>
              <Input id="addr-floor" value={form.floor ?? ""} onChange={(e) => update("floor", e.target.value)} placeholder="e.g. Shreeji Heights" />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-towerBlock">Tower / Block</Label>
              <Input id="addr-towerBlock" value={form.towerBlock ?? ""} onChange={(e) => update("towerBlock", e.target.value)} placeholder="e.g. B block, 4th floor" />
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-landmark">Nearby Landmark</Label>
              <Input id="addr-landmark" value={form.landmark ?? ""} onChange={(e) => update("landmark", e.target.value)} placeholder="e.g. Near Felicia Mall" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block" htmlFor="addr-line1">Area / Street</Label>
              <Input id="addr-line1" value={form.line1} onChange={(e) => update("line1", e.target.value)} placeholder="Set automatically from the map, or type it in" aria-invalid={!!errors.line1} />
              {errors.line1 && <p className="mt-1 text-xs text-danger">{errors.line1}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-city">City</Label>
              <Input id="addr-city" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Ahmedabad" aria-invalid={!!errors.city} />
              {errors.city && <p className="mt-1 text-xs text-danger">{errors.city}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-state">State</Label>
              <Input id="addr-state" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="Gujarat" aria-invalid={!!errors.state} />
              {errors.state && <p className="mt-1 text-xs text-danger">{errors.state}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="addr-pincode">Pincode</Label>
              <Input id="addr-pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="380001" inputMode="numeric" aria-invalid={!!errors.pincode} />
              {errors.pincode && <p className="mt-1 text-xs text-danger">{errors.pincode}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="addr-notes">Delivery Notes (optional)</Label>
            <Textarea id="addr-notes" value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} placeholder="Gate code, preferred delivery time, etc." rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium text-text">Set as default address</p>
              <p className="text-xs text-text-muted">We&apos;ll use this one first at checkout.</p>
            </div>
            <Switch checked={!!form.isDefault} onCheckedChange={(v) => update("isDefault", v)} aria-label="Set as default address" />
          </div>

          {formError && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{formError}</p>}

          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : editing ? "Save Changes" : "Add Address"}
          </Button>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
