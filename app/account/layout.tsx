"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<"loading" | "authed" | "guest">("loading");

  React.useEffect(() => {
    api
      .get("/account/profile")
      .then(() => setStatus("authed"))
      .catch((err) => setStatus(err instanceof ApiError && err.status === 401 ? "guest" : "authed"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (status === "guest") {
    return (
      <div className="mx-auto max-w-md container-px py-24 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface">
          <Lock className="size-6 text-text-muted" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-text">Sign in to view your account</h1>
        <p className="mt-2 text-sm text-text-muted">
          Access your orders, addresses and account settings.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
