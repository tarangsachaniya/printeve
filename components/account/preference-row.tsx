import * as React from "react";
import { cn } from "@/lib/utils";

interface PreferenceRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/** A settings row pairing a label/description with a trailing control (select, segmented buttons, etc). */
export function PreferenceRow({ icon: Icon, label, description, children, disabled }: PreferenceRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          {description && <p className="text-xs text-text-muted">{description}</p>}
        </div>
      </div>
      <div className="shrink-0 sm:pl-4">{children}</div>
    </div>
  );
}
