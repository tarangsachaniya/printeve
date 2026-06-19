import { CheckCircle2, MapPin, FileCheck } from "lucide-react";

const badges = [
  { icon: CheckCircle2, label: "Proof before print" },
  { icon: MapPin, label: "Live tracking" },
  { icon: FileCheck, label: "Free file check" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-4">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Icon className="size-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-text">{label}</span>
        </div>
      ))}
    </div>
  );
}
