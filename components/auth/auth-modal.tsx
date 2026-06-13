"use client";

import * as React from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [tab, setTab] = React.useState<"login" | "register">("login");
  const [forgotMode, setForgotMode] = React.useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setForgotMode(false);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {forgotMode ? (
          <ForgotPasswordView onBack={() => setForgotMode(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{tab === "login" ? "Welcome back" : "Create your account"}</DialogTitle>
              <DialogDescription>
                {tab === "login"
                  ? "Sign in to manage your orders and saved designs."
                  : "Join PrintEve to track orders, save designs and reorder faster."}
              </DialogDescription>
            </DialogHeader>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginView onSuccess={() => handleOpenChange(false)} onForgotPassword={() => setForgotMode(true)} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterView onSuccess={() => handleOpenChange(false)} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LoginView({ onSuccess, onForgotPassword }: { onSuccess: () => void; onForgotPassword: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label className="mb-1.5 block" htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button type="button" onClick={onForgotPassword} className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <PasswordInput id="login-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" className="mt-2" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
      </Button>
    </form>
  );
}

function RegisterView({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ fullName, email, phone, password });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label className="mb-1.5 block" htmlFor="register-fullName">Full Name</Label>
        <Input id="register-fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
      </div>
      <div>
        <Label className="mb-1.5 block" htmlFor="register-email">Email</Label>
        <Input id="register-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <Label className="mb-1.5 block" htmlFor="register-phone">Phone Number</Label>
        <Input id="register-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
      </div>
      <div>
        <Label className="mb-1.5 block" htmlFor="register-password">Password</Label>
        <PasswordInput id="register-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" className="mt-2" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Account"}
      </Button>
    </form>
  );
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
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
      <div className="pt-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10">
          <Mail className="size-6 text-accent" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-text">Check your inbox</h2>
        <p className="mt-2 text-sm text-text-muted">
          If an account exists for <span className="font-medium text-text">{email}</span>, we&apos;ve sent a link to reset your password.
        </p>
        <Button variant="outline" className="mt-6 w-full" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Forgot your password?</DialogTitle>
        <DialogDescription>Enter your email and we&apos;ll send you a reset link.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label className="mb-1.5 block" htmlFor="forgot-email">Email</Label>
          <Input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

        <Button type="submit" size="lg" className="mt-2" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Reset Link"}
        </Button>

        <Button type="button" variant="ghost" onClick={onBack} className="w-full">
          <ArrowLeft className="size-4" /> Back to sign in
        </Button>
      </form>
    </>
  );
}
