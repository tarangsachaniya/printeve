"use client";

import * as React from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const contactDetails = [
  { icon: Phone, label: "Phone", value: "+91 12345 67890", href: "tel:+911234567890" },
  { icon: Mail, label: "Email", value: "support@printeve.com", href: "mailto:support@printeve.com" },
  { icon: MapPin, label: "Address", value: "4th Floor, Print House, MG Road, Bengaluru, Karnataka 560001" },
  { icon: Clock, label: "Business Hours", value: "Mon – Sat, 9:00 AM – 7:00 PM IST" },
];

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      const msg = "Something went wrong. Please try again or email us directly.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl container-px py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Get in Touch</h1>
        <p className="mt-3 text-base text-text-muted">
          Have a question about an order, bulk pricing, or custom artwork? Our team is happy to help.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          {contactDetails.map((item) => (
            <Card key={item.label} className="flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-text-muted">{item.value}</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text">Message sent</h2>
              <p className="max-w-sm text-sm text-text-muted">
                Thanks for reaching out — we&apos;ll get back to you within 24 hours.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="name">Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="subject">Subject</Label>
                <Input id="subject" required value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="How can we help?" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us a bit more about your request..." />
              </div>

              {error && <p className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}

              <Button type="submit" size="lg" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Message"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
