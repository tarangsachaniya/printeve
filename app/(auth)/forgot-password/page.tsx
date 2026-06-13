"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10">
            <Mail className="size-6 text-accent" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-text">Check your inbox</h1>
          <p className="mt-2 text-sm text-text-muted">
            If an account exists for <span className="font-medium text-text">{email}</span>, we&apos;ve sent a link to reset your password.
          </p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/login">
              <ArrowLeft className="size-4" /> Back to Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block" htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

          <Button type="submit" size="lg" className="mt-2" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
