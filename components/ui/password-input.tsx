import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-border bg-background px-3.5 py-2 pr-10 text-sm text-text placeholder:text-text-muted transition-colors focus-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text focus:outline-none"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
