"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClaimButton({
  promotionId,
  code,
  className,
}: {
  promotionId: string;
  code: string;
  className?: string;
}) {
  const router = useRouter();

  async function handleClaim() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Code ${code} copied!`);
    } catch {
      toast.error("Couldn't copy the code — you can still view it below.");
    }
    router.push(`/coupons/${promotionId}`);
  }

  return (
    <Button onClick={handleClaim} size="sm" className={cn("w-full", className)}>
      Claim
    </Button>
  );
}
