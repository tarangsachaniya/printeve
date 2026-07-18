"use client";

import * as React from "react";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Address } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddressCard } from "@/components/account/address-card";
import { AddressModal } from "@/components/account/address-modal";
import { PageHeading } from "@/components/account/settings-section";

export default function AddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [profileDefaults, setProfileDefaults] = React.useState({ fullName: "", phone: "" });

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [defaultingId, setDefaultingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    api
      .get<Address[]>("/account/addresses")
      .then(setAddresses)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Unable to load addresses."))
      .finally(() => setLoading(false));

    api
      .get<{ fullName?: string; phone?: string }>("/account/profile")
      .then((data) => setProfileDefaults({ fullName: data.fullName ?? "", phone: data.phone ?? "" }))
      .catch(() => {});
  }, []);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setModalOpen(true);
  }

  function handleSaved(address: Address, wasEditing: boolean) {
    setAddresses((prev) => {
      const cleared = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return wasEditing ? cleared.map((a) => (a.id === address.id ? address : a)) : [...cleared, address];
    });
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/account/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete address. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSetDefault(id: string) {
    setDefaultingId(id);
    const previous = addresses;
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    try {
      await api.patch<Address>(`/account/addresses/${id}`, { isDefault: true });
    } catch (err) {
      setAddresses(previous);
      toast.error(err instanceof ApiError ? err.message : "Unable to update address. Please try again.");
    } finally {
      setDefaultingId(null);
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
      <div className="flex items-center justify-between gap-4">
        <PageHeading title="Saved Addresses" description="Manage your delivery addresses for faster checkout." />
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface">
            <MapPin className="size-6 text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text">No addresses saved</h3>
          <p className="max-w-sm text-sm text-text-muted">Add a delivery address to speed up checkout next time.</p>
          <Button onClick={openAdd} className="mt-1">
            <Plus className="size-4" /> Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onDelete={() => setDeleteId(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
              settingDefault={defaultingId === address.id}
            />
          ))}
        </div>
      )}

      <AddressModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        profileDefaults={profileDefaults}
        existingAddresses={addresses}
        onSaved={handleSaved}
      />

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
