"use client";

import * as React from "react";
import { Home, Briefcase, Building2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectableTile } from "@/components/ui/selectable-card";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { value: "Home", icon: Home },
  { value: "Work", icon: Briefcase },
  { value: "Hotel", icon: Building2 },
  { value: "Other", icon: MoreHorizontal },
] as const;

type PresetValue = (typeof PRESETS)[number]["value"];

interface AddressLabelPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function AddressLabelPicker({ value, onChange }: AddressLabelPickerProps) {
  // Which tile is highlighted is tracked independently of the raw label so
  // typing a custom name (even one that happens to say "Home") doesn't
  // silently deselect the "Other" tile the user explicitly chose.
  const [activePreset, setActivePreset] = React.useState<PresetValue>(() =>
    (PRESETS.some((p) => p.value === value) ? (value as PresetValue) : value ? "Other" : "Home")
  );

  function selectPreset(preset: PresetValue) {
    setActivePreset(preset);
    if (preset !== "Other") onChange(preset);
    else onChange("");
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const selected = activePreset === preset.value;
          return (
            <SelectableTile
              key={preset.value}
              selected={selected}
              onClick={() => selectPreset(preset.value)}
              className="items-center gap-1.5 py-3 text-center"
            >
              <Icon className={cn("size-4", selected ? "text-primary" : "text-text-muted")} />
              <span className={cn("text-xs font-medium", selected ? "text-primary" : "text-text")}>{preset.value}</span>
            </SelectableTile>
          );
        })}
      </div>
      {activePreset === "Other" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Label this address (e.g. Studio, In-laws')"
          autoFocus
        />
      )}
    </div>
  );
}
