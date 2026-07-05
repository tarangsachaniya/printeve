import * as React from "react";
import { cn } from "@/lib/utils";

function IconChip({
  className,
  size = "md",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
        size === "sm" ? "size-8" : "size-10",
        className
      )}
      {...props}
    />
  );
}

export { IconChip };
