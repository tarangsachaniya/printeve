import Link from "next/link";
import { Printer, ExternalLink } from "lucide-react";
import packageJson from "@/package.json";
import { SettingsSection, PageHeading } from "@/components/account/settings-section";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="About" description="What you're running, and where to learn more." />

      <SettingsSection title="Priinteve for Web">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Printer className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">Priinteve</p>
            <p className="text-xs text-text-muted">Version {packageJson.version}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-text-muted">
          Business cards, flyers, brochures, posters, banners, stickers, packaging and bulk printing —
          designed, printed and delivered with precision.
        </p>
      </SettingsSection>

      <SettingsSection title="More">
        <div className="flex flex-col gap-2">
          <Link href="/about" className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-medium text-text transition-colors hover:border-primary/40">
            About Priinteve
            <ExternalLink className="size-4 text-text-muted" />
          </Link>
          <Link href="/account/help" className="flex items-center justify-between rounded-xl border border-border p-4 text-sm font-medium text-text transition-colors hover:border-primary/40">
            Help & Support
            <ExternalLink className="size-4 text-text-muted" />
          </Link>
        </div>
      </SettingsSection>
    </div>
  );
}
