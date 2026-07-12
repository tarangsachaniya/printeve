"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ShieldCheck, Loader2, Lock, ShoppingBag, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Address, CartItem } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useCity } from "@/lib/city";
import { useBuyNow } from "@/lib/buy-now";
import { createOrder, type CreateOrderPayload } from "@/lib/orders";
import { validateCoupon, type CouponValidationResult } from "@/lib/coupons";
import { useSiteSettings, usePricingConfig } from "@/lib/site-settings";
import { computeOrderBill } from "@/lib/pricing";
import { formatPrice, cn, isValidIndianPhone } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { CitySelect, StateSelect } from "@/components/ui/city-select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconChip } from "@/components/ui/icon-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { selectableCardClasses } from "@/components/ui/selectable-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buy-now";
  const cart = useCart();
  const buyNow = useBuyNow();
  const settings = useSiteSettings();
  const pricingConfig = usePricingConfig();
  const { cities, cityId } = useCity();
  const { user, loading: authLoading } = useAuth();
  const addressStates = Array.from(new Set(cities.map((c) => c.state)));

  const items: CartItem[] = isBuyNow ? (buyNow.item ? [buyNow.item] : []) : cart.items;
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const [step, setStep] = React.useState<Step>("address");
  const [authModalOpen, setAuthModalOpen] = React.useState(true);
  const [address, setAddress] = React.useState<AddressForm>(EMPTY_ADDRESS);
  const [paying, setPaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [placed, setPlaced] = React.useState(false);

  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const [savedAddresses, setSavedAddresses] = React.useState<Address[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [addAddressOpen, setAddAddressOpen] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState<Omit<Address, "id">>({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = React.useState(false);

  React.useEffect(() => {
    api
      .get<Address[]>("/account/addresses")
      .then((data) => {
        setSavedAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => setSavedAddresses([]));
  }, []);

  // Checkout requires login: if the guest dismisses the auth modal without
  // signing in, there's nothing left to do here — send them back to the cart.
  React.useEffect(() => {
    if (!authLoading && !user && !authModalOpen) {
      router.push("/cart");
    }
  }, [authLoading, user, authModalOpen, router]);

  const selectedAddress = savedAddresses?.find((a) => a.id === selectedAddressId) ?? null;

  function updateNewAddress<K extends keyof Omit<Address, "id">>(key: K, value: Address[K]) {
    setNewAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveNewAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIndianPhone(newAddress.phone)) {
      const msg = "Please enter a valid 10-digit mobile number.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setSavingAddress(true);
    setError(null);
    try {
      const created = await api.post<Address>("/account/addresses", newAddress);
      setSavedAddresses((prev) => {
        const next = created.isDefault ? (prev ?? []).map((a) => ({ ...a, isDefault: false })) : (prev ?? []);
        return [...next, created];
      });
      setSelectedAddressId(created.id);
      setAddAddressOpen(false);
      setNewAddress({ label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to save address. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingAddress(false);
    }
  }

  // The address actually used for review/payment: a selected saved address, else the manual form.
  const reviewAddress: AddressForm | null = selectedAddress
    ? {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        line1: selectedAddress.line1,
        line2: selectedAddress.line2 ?? "",
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      }
    : (savedAddresses && savedAddresses.length > 0 ? null : address);

  const discount = appliedCoupon?.discountAmount ?? 0;
  const netSubtotal = Math.max(0, subtotal - discount);
  const cityDeliveryFee = cities.find((c) => c.id === cityId)?.price ?? 0;
  const bill = computeOrderBill(netSubtotal, pricingConfig, cityDeliveryFee);
  const total = bill.grandTotal;

  const usingSavedAddresses = !!savedAddresses && savedAddresses.length > 0;

  const addressValid = usingSavedAddresses
    ? !!selectedAddressId
    : !!(
        address.fullName.trim() &&
        isValidIndianPhone(address.phone) &&
        address.line1.trim() &&
        address.city.trim() &&
        address.state.trim() &&
        address.pincode.trim()
      );

  function updateAddress<K extends keyof AddressForm>(key: K, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function ensureAddressId(): Promise<string> {
    if (selectedAddressId) return selectedAddressId;
    const created = await api.post<Address>("/account/addresses", {
      label: "Home",
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: true,
    });
    setSelectedAddressId(created.id);
    setSavedAddresses((prev) => [...(prev ?? []), created]);
    return created.id;
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponInput, subtotal);
      setAppliedCoupon(result);
      toast.success(`Coupon applied! Saved ${formatPrice(result.discountAmount)}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid coupon.";
      setCouponError(msg);
      setAppliedCoupon(null);
      toast.error(msg);
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      // Razorpay-ready: in production this would open Razorpay Checkout with the returned order id.
      // For now we immediately confirm to simulate a successful payment.
      await api.post<{ id: string; amount: number; currency: string }>("/checkout/initiate", {
        amount: total,
      });

      const addressId = await ensureAddressId();

      const payload: CreateOrderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          optionValueIds: i.selection.options.map((o) => o.field_option_value_id),
        })),
        addressId,
        couponCode: appliedCoupon?.coupon.code,
      };

      await createOrder(payload);

      if (isBuyNow) buyNow.clear(); else cart.clear();
      setPlaced(true);
    } catch (err) {
      let msg: string;
      if (err instanceof ApiError) {
        msg = err.status === 401 ? "Please sign in to complete your order." : err.message;
      } else {
        msg = "Something went wrong. Please try again.";
      }
      setError(msg);
      toast.error(msg);
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

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl container-px py-10 lg:py-14">
        <Skeleton className="h-8 w-32" />
        <div className="mt-6 flex items-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-4 w-16" />
              {i < 2 && <span className="mx-1 h-px w-8 bg-border sm:w-16" />}
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
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
        <h1 className="mt-5 text-2xl font-bold text-text">
          {isBuyNow ? "No item selected" : settings.empty_cart_title || "Your cart is empty"}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {isBuyNow
            ? "Choose a product to buy it directly."
            : settings.empty_cart_subtitle || "Add some products before checking out."}
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const meetsMinOrder = subtotal >= pricingConfig.min_order_price;

  if (!meetsMinOrder) {
    return (
      <div className="mx-auto max-w-3xl container-px py-20 text-center">
        <h1 className="text-2xl font-bold text-text">Add a bit more to checkout</h1>
        <p className="mt-2 text-sm text-text-muted">
          Minimum order amount is {formatPrice(pricingConfig.min_order_price)}. Add {formatPrice(pricingConfig.min_order_price - subtotal)} more to proceed.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "mx-auto max-w-7xl container-px py-10 lg:py-14",
          !user && "pointer-events-none select-none opacity-50"
        )}
        aria-hidden={!user}
      >
      <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Checkout</h1>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-4">
        {STEPS.map((s, idx) => {
          const isActive = s.id === step;
          const isDone = STEPS.findIndex((x) => x.id === step) > idx;
          const circle = (
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
          );
          const labelText = (
            <span className={cn("text-sm font-medium", isActive ? "text-text" : "text-text-muted")}>
              {s.label}
            </span>
          );
          return (
            <li key={s.id} className="flex items-center gap-2">
              {isDone ? (
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                >
                  {circle}
                  {labelText}
                </button>
              ) : (
                <>
                  {circle}
                  {labelText}
                </>
              )}
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

              {savedAddresses === null ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : usingSavedAddresses ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {savedAddresses.map((a) => {
                    const isSelected = a.id === selectedAddressId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAddressId(a.id)}
                        className={cn("flex flex-col gap-1 p-4 text-left", selectableCardClasses(isSelected))}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text">{a.label}</span>
                          {a.isDefault && <Badge variant="accent">Default</Badge>}
                        </div>
                        <p className="text-sm font-medium text-text">{a.fullName}</p>
                        <p className="text-sm text-text-muted">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                        </p>
                        <p className="text-sm text-text-muted">{a.phone}</p>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setAddAddressOpen(true)}
                    className="flex min-h-[128px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border p-4 text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Plus className="size-5" />
                    <span className="text-sm font-medium">Add New Address</span>
                  </button>
                </div>
              ) : (
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
                    <CitySelect
                      cities={cities}
                      value={cities.find((c) => c.name === address.city)?.id ?? ""}
                      onValueChange={(id) => {
                        const city = cities.find((c) => c.id === id);
                        if (!city) return;
                        updateAddress("city", city.name);
                        updateAddress("state", city.state);
                      }}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block" htmlFor="state">State</Label>
                    <StateSelect
                      states={addressStates}
                      value={address.state}
                      onValueChange={(state) => updateAddress("state", state)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block" htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={address.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} placeholder="400001" />
                  </div>
                </div>
              )}

              <Button size="lg" className="mt-6" disabled={!addressValid} onClick={() => setStep("review")}>
                Continue to Review
              </Button>
            </Card>
          )}

          {step === "review" && reviewAddress && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-text">Review Your Order</h2>

              <div className="mt-4 rounded-md border border-border p-4">
                <p className="text-sm font-semibold text-text">{reviewAddress.fullName}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {reviewAddress.line1}
                  {reviewAddress.line2 ? `, ${reviewAddress.line2}` : ""}, {reviewAddress.city}, {reviewAddress.state} {reviewAddress.pincode}
                </p>
                <p className="mt-1 text-sm text-text-muted">{reviewAddress.phone}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStep("address")}
                  className="mt-2 bg-neutral-900 text-white hover:bg-neutral-800 border-transparent"
                >
                  Edit address
                </Button>
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

              <div className="mt-4 border-t border-border pt-4">
                <Label className="mb-1.5 block" htmlFor="coupon">Have a coupon?</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput("");
                        setCouponError(null);
                      }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={validatingCoupon || !couponInput.trim()}>
                      {validatingCoupon ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                    </Button>
                  )}
                </div>
                {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}
                {appliedCoupon && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    &ldquo;{appliedCoupon.coupon.code}&rdquo; applied — you saved {formatPrice(appliedCoupon.discountAmount)}
                  </p>
                )}
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
                <IconChip>
                  <Lock className="size-5" />
                </IconChip>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Service</p>
              <div className="flex justify-between">
                <dt className="text-text-muted">Subtotal</dt>
                <dd className="text-text">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-primary">Discount</dt>
                  <dd className="text-primary">-{formatPrice(discount)}</dd>
                </div>
              )}
              {pricingConfig.cgst_percent > 0 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">CGST ({pricingConfig.cgst_percent}%)</dt>
                  <dd className="text-text">{formatPrice(bill.cgstAmount)}</dd>
                </div>
              )}
              {pricingConfig.sgst_percent > 0 && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">SGST ({pricingConfig.sgst_percent}%)</dt>
                  <dd className="text-text">{formatPrice(bill.sgstAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-medium">
                <dt className="text-text">Service Total</dt>
                <dd className="text-text">{formatPrice(bill.serviceTotal)}</dd>
              </div>

              {bill.platformFee > 0 && (
                <>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Platform Fee</p>
                  <div className="flex justify-between border-t border-border pt-2 font-medium">
                    <dt className="text-text">Platform Fee Total</dt>
                    <dd className="text-text">{formatPrice(bill.platformFee)}</dd>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-2">
                <dt className="text-text-muted">Delivery</dt>
                <dd className="text-text">{bill.deliveryFee === 0 ? "Free" : formatPrice(bill.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt className="text-text">Total</dt>
                <dd className="text-text">{formatPrice(total)}</dd>
              </div>
            </dl>
            {!isBuyNow && (
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/cart")}>
                Back to Cart
              </Button>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
            <DialogDescription>Enter the delivery address details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewAddress} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block" htmlFor="newLabel">Label</Label>
                <Input id="newLabel" required value={newAddress.label} onChange={(e) => updateNewAddress("label", e.target.value)} placeholder="Home / Office" />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="newFullName">Full Name</Label>
                <Input id="newFullName" required value={newAddress.fullName} onChange={(e) => updateNewAddress("fullName", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="newPhone">Phone Number</Label>
                <Input id="newPhone" required value={newAddress.phone} onChange={(e) => updateNewAddress("phone", e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="newLine1">Address Line 1</Label>
                <Input id="newLine1" required value={newAddress.line1} onChange={(e) => updateNewAddress("line1", e.target.value)} placeholder="Street address" />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block" htmlFor="newLine2">Address Line 2 (optional)</Label>
                <Input id="newLine2" value={newAddress.line2 ?? ""} onChange={(e) => updateNewAddress("line2", e.target.value)} placeholder="Apartment, suite, etc." />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="newCity">City</Label>
                <CitySelect
                  cities={cities}
                  value={cities.find((c) => c.name === newAddress.city)?.id ?? ""}
                  onValueChange={(id) => {
                    const city = cities.find((c) => c.id === id);
                    if (!city) return;
                    updateNewAddress("city", city.name);
                    updateNewAddress("state", city.state);
                  }}
                />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="newState">State</Label>
                <StateSelect
                  states={addressStates}
                  value={newAddress.state}
                  onValueChange={(state) => updateNewAddress("state", state)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block" htmlFor="newPincode">Pincode</Label>
                <Input id="newPincode" required value={newAddress.pincode} onChange={(e) => updateNewAddress("pincode", e.target.value)} placeholder="400001" />
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-2" disabled={savingAddress}>
              {savingAddress ? <Loader2 className="size-4 animate-spin" /> : "Add Address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>
      {!user && <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />}
    </>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={null}>
      <CheckoutForm />
    </React.Suspense>
  );
}
