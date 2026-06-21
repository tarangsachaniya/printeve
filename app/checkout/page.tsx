"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, Lock, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FREE_DELIVERY_THRESHOLD = 1000;
const DELIVERY_FEE = 99;

type Step = "address" | "review" | "payment";

interface AddressForm {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const STEPS: { id: Step; label: string }[] = [
  { id: "address", label: "Address" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [step, setStep] = React.useState<Step>("address");
  const [address, setAddress] = React.useState<AddressForm>(EMPTY_ADDRESS);
  const [paying, setPaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [placed, setPlaced] = React.useState(false);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const addressValid =
    address.fullName.trim() &&
    address.phone.trim() &&
    address.line1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.pincode.trim();

  function updateAddress<K extends keyof AddressForm>(key: K, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const order = await api.post<{ id: string; amount: number; currency: string }>("/checkout/initiate", {
        amount: total,
      });

      // Razorpay-ready: in production this would open Razorpay Checkout with `order.id`.
      // For now we immediately confirm to simulate a successful payment.
      await api.post("/checkout/confirm", {
        razorpay_order_id: order?.id,
        address,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          selection: i.selection,
        })),
        subtotal,
        deliveryFee,
        total,
      });

      clear();
      setPlaced(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Please sign in to complete your order.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setPaying(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl container-px py-24 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-8 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text">Order placed successfully!</h1>
        <p className="mt-2 text-sm text-text-muted">
          Thank you for your order. We&apos;ve sent a confirmation to your email and will start production shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/account/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl container-px py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface">
          <ShoppingBag className="size-7 text-text-muted" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-text">Your cart is empty</h1>
        <p className="mt-2 text-sm text-text-muted">Add some products before checking out.</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Checkout</h1>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-4">
        {STEPS.map((s, idx) => {
          const isActive = s.id === step;
          const isDone = STEPS.findIndex((x) => x.id === step) > idx;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-text-muted"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : idx + 1}
              </span>
              <span className={cn("text-sm font-medium", isActive ? "text-text" : "text-text-muted")}>
                {s.label}
              </span>
              {idx < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border sm:w-16" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === "address" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-text">Delivery Address</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={address.fullName} onChange={(e) => updateAddress("fullName", e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={address.phone} onChange={(e) => updateAddress("phone", e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="line1">Address Line 1</Label>
                  <Input id="line1" value={address.line1} onChange={(e) => updateAddress("line1", e.target.value)} placeholder="Street address, building, etc." />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block" htmlFor="line2">Address Line 2 (optional)</Label>
                  <Input id="line2" value={address.line2} onChange={(e) => updateAddress("line2", e.target.value)} placeholder="Apartment, suite, unit, etc." />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={(e) => updateAddress("city", e.target.value)} placeholder="Mumbai" />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={(e) => updateAddress("state", e.target.value)} placeholder="Maharashtra" />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={address.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} placeholder="400001" />
                </div>
              </div>
              <Button size="lg" className="mt-6" disabled={!addressValid} onClick={() => setStep("review")}>
                Continue to Review
              </Button>
            </Card>
          )}

          {step === "review" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-text">Review Your Order</h2>

              <div className="mt-4 rounded-md border border-border p-4">
                <p className="text-sm font-semibold text-text">{address.fullName}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
                </p>
                <p className="mt-1 text-sm text-text-muted">{address.phone}</p>
                <button onClick={() => setStep("address")} className="mt-2 text-xs font-medium text-primary hover:underline">
                  Edit address
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-text">{item.name}</p>
                      <p className="text-xs text-text-muted">
                        {[
                          ...(item.selection.options ?? []).map((o) => `${o.option_label}: ${o.value_label}`),
                          item.selection.custom_dimensions &&
                            `${item.selection.custom_dimensions.width} × ${item.selection.custom_dimensions.height} ${item.selection.custom_dimensions.unit}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}{" "}
                        · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-text">{formatPrice(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-6" onClick={() => setStep("payment")}>
                Continue to Payment
              </Button>
            </Card>
          )}

          {step === "payment" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-text">Payment</h2>
              <p className="mt-1 text-sm text-text-muted">
                Secure payment powered by Razorpay. You&apos;ll be redirected to complete payment.
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-surface p-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Lock className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Razorpay Secure Checkout</p>
                  <p className="text-xs text-text-muted">Cards, UPI, Netbanking & Wallets supported</p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>
              )}

              <Button size="lg" className="mt-6 w-full" onClick={handlePay} disabled={paying}>
                {paying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>Pay {formatPrice(total)}</>
                )}
              </Button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
                <ShieldCheck className="size-3.5" /> 100% secure payments
              </p>
            </Card>
          )}
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-24 p-5">
            <h2 className="text-base font-semibold text-text">Order Summary</h2>
            <p className="mt-1 text-xs text-text-muted">{items.length} item{items.length > 1 ? "s" : ""}</p>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Subtotal</dt>
                <dd className="text-text">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Delivery</dt>
                <dd className="text-text">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt className="text-text">Total</dt>
                <dd className="text-text">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/cart")}>
              Back to Cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
