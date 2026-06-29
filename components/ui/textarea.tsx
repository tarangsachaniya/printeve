import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, onFocus, ...props }, ref) => {
    function handleFocus(e: React.FocusEvent<HTMLTextAreaElement>) {
      onFocus?.(e);
      requestAnimationFrame(() => {
        e.target.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }

    return (
      <textarea
        ref={ref}
        onFocus={handleFocus}
        className={cn(
          "flex min-h-28 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
