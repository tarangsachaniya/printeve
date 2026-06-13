"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Clock, CheckCircle2, FileText, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import type { Product, PriceBreakdown } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { estimatePrice, defaultOption } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function formatCompletion(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [sizeId, setSizeId] = React.useState(defaultOption(product.paper_sizes)?.id ?? "");
  const [typeId, setTypeId] = React.useState(defaultOption(product.paper_types)?.id ?? "");
  const [qualityId, setQualityId] = React.useState(defaultOption(product.paper_qualities)?.id ?? "");
  const [quantity, setQuantity] = React.useState(product.quantity_slabs[0]?.min_qty ?? 1);
  const [breakdown, setBreakdown] = React.useState<PriceBreakdown | null>(() =>
    estimatePrice(product, { paper_size_id: sizeId, paper_quality_id: qualityId, paper_type_id: typeId, quantity })
  );
  const [priceError, setPriceError] = React.useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [added, setAdded] = React.useState(false);

  const selection = React.useMemo(
    () => ({ paper_size_id: sizeId, paper_quality_id: qualityId || undefined, paper_type_id: typeId, quantity }),
    [sizeId, qualityId, typeId, quantity]
  );

  React.useEffect(() => {
    // Instant client-side estimate
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recompute estimate immediately when selection changes, ahead of the debounced server price
    setBreakdown(estimatePrice(product, selection));
    setPriceError(null);

    if (!sizeId || !typeId || quantity <= 0) return;

    const timeout = setTimeout(async () => {
      setLoadingPrice(true);
      try {
        const data = await api.post<PriceBreakdown>(`/products/${product.id}/price`, selection);
        setBreakdown(data);
        setPriceError(null);
      } catch (err) {
        if (err instanceof ApiError) setPriceError(err.message);
      } finally {
        setLoadingPrice(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeId, typeId, qualityId, quantity, product.id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleAddToCart() {
    if (!breakdown) return;

    const size = product.paper_sizes.find((s) => s.id === sizeId);
    const type = product.paper_types.find((t) => t.id === typeId);
    const quality = product.paper_qualities.find((q) => q.id === qualityId);

    addItem({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] ?? null,
      slug: product.slug,
      quantity,
      unitPrice: breakdown.unit_price,
      totalPrice: breakdown.total_price,
      selection: {
        paper_size: size ? { id: size.id, name: size.name } : undefined,
        paper_quality: quality ? { id: quality.id, name: quality.name } : undefined,
        paper_type: type ? { id: type.id, name: type.name } : undefined,
      },
      artworkFileName: file?.name,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const completion = formatCompletion(breakdown?.max_completion_minutes ?? null);
  const matchedSlab = breakdown?.matched_slab;
  const canAddToCart = !!breakdown && !priceError;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{product.name}</h1>
      </div>

      {/* Price */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text">
            {breakdown ? formatPrice(breakdown.unit_price) : formatPrice(product.base_price)}
          </span>
          <span className="text-sm text-text-muted">/ unit</span>
          {loadingPrice && <Loader2 className="size-4 animate-spin text-text-muted" />}
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Total for {quantity.toLocaleString()} units:{" "}
          <span className="font-semibold text-text">
            {breakdown ? formatPrice(breakdown.total_price) : "—"}
          </span>
        </p>
        {priceError && <p className="mt-2 text-sm text-danger">{priceError}</p>}
        {completion && !priceError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <Clock className="size-3.5" /> Estimated production time: {completion}
          </p>
        )}
      </div>

      {/* Paper size */}
      {product.paper_sizes.length > 0 && (
        <div>
          <Label className="mb-2 block">Paper Size</Label>
          <Select value={sizeId} onValueChange={setSizeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {product.paper_sizes.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.price_modifier !== 0 &&
                    ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Paper type */}
      {product.paper_types.length > 0 && (
        <div>
          <Label className="mb-2 block">Paper Type</Label>
          <Select value={typeId} onValueChange={setTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {product.paper_types.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.price_modifier !== 0 &&
                    ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Paper quality */}
      {product.paper_qualities.length > 0 && (
        <div>
          <Label className="mb-2 block">Paper Quality</Label>
          <Select value={qualityId} onValueChange={setQualityId}>
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {product.paper_qualities.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.price_modifier !== 0 &&
                    ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="mb-2 block">Quantity</Label>
        {product.quantity_slabs.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {product.quantity_slabs.map((slab) => {
              const isActive = matchedSlab && matchedSlab.min_qty === slab.min_qty && matchedSlab.max_qty === slab.max_qty;
              return (
                <button
                  key={slab.id}
                  onClick={() => setQuantity(slab.min_qty)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:border-primary/40"
                  )}
                >
                  {slab.min_qty.toLocaleString()}
                  {slab.max_qty ? `–${slab.max_qty.toLocaleString()}` : "+"}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex h-11 w-40 items-center rounded-md border border-border">
          <button
            className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="h-full w-full flex-1 border-x border-border bg-background text-center text-sm font-medium text-text focus-ring"
            aria-label="Quantity"
          />
          <button
            className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-primary"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Artwork upload */}
      <div>
        <Label className="mb-2 block">Upload Artwork (optional)</Label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface px-6 py-8 text-center transition-colors hover:border-primary/40">
          <Upload className="size-6 text-text-muted" />
          {file ? (
            <span className="flex items-center gap-2 text-sm font-medium text-text">
              <FileText className="size-4" /> {file.name}
            </span>
          ) : (
            <>
              <span className="text-sm font-medium text-text">Click to upload or drag and drop</span>
              <span className="text-xs text-text-muted">PDF, AI, PNG or JPG up to 50MB</span>
            </>
          )}
          <input type="file" className="hidden" accept=".pdf,.ai,.eps,.psd,.png,.jpg,.jpeg" onChange={handleFileChange} />
        </label>
      </div>

      {/* Price breakdown */}
      {breakdown && (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-text mb-2">Price Breakdown</h3>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Base price</dt>
              <dd className="text-text">{formatPrice(breakdown.base_unit_price)}</dd>
            </div>
            {breakdown.modifiers.paper_size && breakdown.modifiers.paper_size.amount !== 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">{breakdown.modifiers.paper_size.name}</dt>
                <dd className="text-text">{formatPrice(breakdown.modifiers.paper_size.amount)}</dd>
              </div>
            )}
            {breakdown.modifiers.paper_type && breakdown.modifiers.paper_type.amount !== 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">{breakdown.modifiers.paper_type.name}</dt>
                <dd className="text-text">{formatPrice(breakdown.modifiers.paper_type.amount)}</dd>
              </div>
            )}
            {breakdown.modifiers.paper_quality && breakdown.modifiers.paper_quality.amount !== 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">{breakdown.modifiers.paper_quality.name}</dt>
                <dd className="text-text">{formatPrice(breakdown.modifiers.paper_quality.amount)}</dd>
              </div>
            )}
            {breakdown.modifiers.quantity_slab && breakdown.modifiers.quantity_slab.amount !== 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Quantity discount/adjustment</dt>
                <dd className="text-text">{formatPrice(breakdown.modifiers.quantity_slab.amount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
              <dt className="text-text">Unit price</dt>
              <dd className="text-text">{formatPrice(breakdown.unit_price)}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Add to cart */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!canAddToCart}>
          {added ? (
            <>
              <CheckCircle2 className="size-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" /> Add to Cart
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => {
            handleAddToCart();
            router.push("/cart");
          }}
          disabled={!canAddToCart}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
