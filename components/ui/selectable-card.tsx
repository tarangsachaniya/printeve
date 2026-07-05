import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared border+tint selection styling used across tier cards, address cards, and toggles. */
function selectableCardClasses(selected: boolean) {
  return cn(
    "rounded-xl border-2 transition-all",
    selected
      ? "border-primary bg-primary/5 shadow-sm"
      : "border-border bg-surface hover:border-primary/40"
  );
}

interface SelectableTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

const SelectableTile = React.forwardRef<HTMLButtonElement, SelectableTileProps>(
  ({ className, selected, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "relative flex flex-col items-start p-4 text-left",
          selectableCardClasses(selected),
          className
        )}
        {...props}
      />
    );
  }
);
SelectableTile.displayName = "SelectableTile";

export { SelectableTile, selectableCardClasses };
