"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Languages, Coins, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";
import { PreferenceRow } from "@/components/account/preference-row";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Preferences" description="How Priinteve looks and speaks to you." />

      <SettingsSection title="Appearance">
        <PreferenceRow icon={Sun} label="Theme" description="Switch between light and dark, or follow your system setting.">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = mounted && theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    active ? "bg-background text-text shadow-sm" : "text-text-muted hover:text-text"
                  )}
                  aria-pressed={active}
                >
                  <Icon className="size-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </PreferenceRow>
      </SettingsSection>

      <SettingsSection title="Region" description="More options are on the way.">
        <div className="flex flex-col gap-3">
          <PreferenceRow icon={Languages} label="Language" description="Multi-language support is coming soon." disabled>
            <span className="text-sm text-text-muted">English (India)</span>
          </PreferenceRow>
          <PreferenceRow icon={Coins} label="Currency" description="Priinteve currently prices everything in INR." disabled>
            <span className="text-sm text-text-muted">₹ INR</span>
          </PreferenceRow>
          <PreferenceRow icon={Clock} label="Timezone" description="Order times are shown in India Standard Time." disabled>
            <span className="text-sm text-text-muted">IST (UTC+5:30)</span>
          </PreferenceRow>
        </div>
      </SettingsSection>
    </div>
  );
}
