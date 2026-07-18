import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Consistent card shell for every settings sub-section — title/description/action header, content below. */
export function SettingsSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SettingsSectionProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-1">
      <h1 className="text-xl font-semibold text-text sm:text-2xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
    </div>
  );
}
