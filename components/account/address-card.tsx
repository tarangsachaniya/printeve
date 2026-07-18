"use client";

import { Home, Briefcase, Building2, MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function labelIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("home")) return Home;
  if (l.includes("work") || l.includes("office")) return Briefcase;
  if (l.includes("hotel")) return Building2;
  return MapPin;
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  settingDefault?: boolean;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, settingDefault }: AddressCardProps) {
  const Icon = labelIcon(address.label);

  return (
    <Card className="flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-semibold text-text">{address.label}</span>
          {address.isDefault && <Badge variant="accent">Default</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-primary focus-ring" aria-label={`Edit ${address.label} address`}>
            <Pencil className="size-4" />
          </button>
          <button onClick={onDelete} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-danger focus-ring" aria-label={`Delete ${address.label} address`}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text">{address.fullName}</p>
        <p className="mt-0.5 text-sm text-text-muted">
          {[address.houseNumber, address.floor, address.towerBlock].filter(Boolean).join(", ")}
          {address.houseNumber || address.floor || address.towerBlock ? ", " : ""}
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
        </p>
        {address.landmark && <p className="mt-0.5 text-xs text-text-muted">Near {address.landmark}</p>}
        <p className="mt-1 text-sm text-text-muted">{address.phone}</p>
      </div>

      {!address.isDefault && (
        <button
          onClick={onSetDefault}
          disabled={settingDefault}
          className="flex items-center gap-1.5 self-start text-xs font-medium text-primary hover:underline disabled:opacity-60"
        >
          {settingDefault ? <Loader2 className="size-3.5 animate-spin" /> : <Star className="size-3.5" />}
          Set as default
        </button>
      )}
    </Card>
  );
}
