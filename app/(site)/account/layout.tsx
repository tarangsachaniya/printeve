"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthModal } from "@/components/auth/auth-modal";
import { SettingsSidebar } from "@/components/account/settings-sidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<"loading" | "authed" | "guest">("loading");
  const [authOpen, setAuthOpen] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    api
      .get("/account/profile")
      .then(() => setStatus("authed"))
      .catch((err) => setStatus(err instanceof ApiError && err.status === 401 ? "guest" : "authed"));
  }, []);

  React.useEffect(() => {
    if (user && status === "guest") setStatus("authed");
  }, [user, status]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl container-px py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden w-60 shrink-0 flex-col gap-3 lg:flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="size-8 rounded-xl" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
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
        <Button size="lg" className="mt-6" onClick={() => setAuthOpen(true)}>
          Sign In
        </Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl container-px py-8 lg:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <SettingsSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
