"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClaimButton({ code, className }: { code: string; className?: string }) {
  async function handleClaim() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Code ${code} copied!`);
    } catch {
      toast.error("Couldn't copy the code — it's shown above, copy it manually.");
    }
  }

  return (
    <Button onClick={handleClaim} size="sm" className={cn("w-full", className)}>
      Copy code
    </Button>
  );
}
