import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, onFocus, ...props }, ref) => {
    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      onFocus?.(e);
      requestAnimationFrame(() => {
        e.target.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }

    return (
      <input
        type={type}
        ref={ref}
        onFocus={handleFocus}
        className={cn(
          "flex h-11 w-full rounded-md border border-border bg-background px-3.5 py-2 text-sm text-text placeholder:text-text-muted transition-colors focus-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
