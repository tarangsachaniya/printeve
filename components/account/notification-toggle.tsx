"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface NotificationToggleProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  busy?: boolean;
  disabled?: boolean;
}

export function NotificationToggle({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  busy,
  disabled,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <div className={cn("flex items-center gap-2", disabled && "opacity-50")}>
        {busy && <Loader2 className="size-3.5 animate-spin text-text-muted" />}
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled || busy} aria-label={label} />
      </div>
    </div>
  );
}
