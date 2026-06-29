"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Clock, CheckCircle2, FileText, Minus, Plus, ShoppingCart, Star, Info } from "lucide-react";
import type { Product, PriceLookupResult, PricingMatrixRow, DimensionUnit } from "@/lib/types";
import { defaultOptionValue } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { useCity } from "@/lib/city";
import { formatPrice, cn } from "@/lib/utils";
import { convertDimension, isCustomSize, DIMENSION_UNITS } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrustBadges } from "@/components/products/trust-badges";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function formatCompletion(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { cityId } = useCity();

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    for (const option of product.options) {
      if (option.field_type === "multi_select") {
        const defVal = defaultOptionValue(option);
        initial[option.id] = defVal ? [defVal] : [];
      } else {
        const defVal = defaultOptionValue(option);
        if (defVal) initial[option.id] = defVal;
      }
    }
    return initial;
  });

  const tiers = React.useMemo(() => {
    const qs = product.available_quantities;
    if (qs.length === 0) return [];
    if (qs.length === 1) return [qs[0]];
    if (qs.length === 2) return [qs[0], qs[qs.length - 1]];
    const min = qs[0];
    const max = qs[qs.length - 1];
    const midTarget = Math.round((min + max) / 2);
    const mid = qs.reduce((prev, curr) =>
      Math.abs(curr - midTarget) < Math.abs(prev - midTarget) ? curr : prev
    );
    if (mid === min || mid === max) {
      const midIdx = Math.floor(qs.length / 2);
      return [min, qs[midIdx], max];
    }
    return [min, mid, max];
  }, [product.available_quantities]);

  const minQty = tiers[0] ?? 1;

  const [quantity, setQuantity] = React.useState(tiers[0] ?? 1);
  const [file, setFile] = React.useState<File | null>(null);
  const [added, setAdded] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = React.useState(false);
  const guidelines = product.guidelines ?? [];

  const [customWidth, setCustomWidth] = React.useState("");
  const [customHeight, setCustomHeight] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState<DimensionUnit>("cm");

  const optionValueIds = React.useMemo(
    () => Object.values(selectedOptions).flatMap(v => Array.isArray(v) ? v : v ? [v] : []),
    [selectedOptions]
  );

  const paperSizeOption = product.options.find((o) => o.key === "paper_size");
  const selectedSizeValueId = paperSizeOption ? selectedOptions[paperSizeOption.id] as string | undefined : undefined;
  const selectedSizeValue = paperSizeOption?.values.find((v) => v.field_option_value_id === selectedSizeValueId);
  const showCustomDimensions = isCustomSize(selectedSizeValue?.value);
  const customDimensionsValid =
    !showCustomDimensions || (Number(customWidth) > 0 && Number(customHeight) > 0);

  // Pricing is computed entirely client-side from the embedded pricing_matrix —
  // no per-selection API calls. We match only the pricing-relevant option ids so
  // non-pricing selections (e.g. optional finishes) don't break the lookup.
  const pricingRelevantIds = React.useMemo(
    () => new Set((product.pricing_matrix ?? []).flatMap((r) => r.option_value_ids)),
    [product.pricing_matrix]
  );

  // City-specific rows when any exist, else the all-cities (null) rows — mirrors
  // the server's previous city fallback in PricingService.lookupPrice.
  const cityMatrix = React.useMemo(() => {
    const matrix = product.pricing_matrix ?? [];
    if (cityId) {
      const cityRows = matrix.filter((r) => r.city_id === cityId);
      if (cityRows.length) return cityRows;
    }
    return matrix.filter((r) => r.city_id == null);
  }, [product.pricing_matrix, cityId]);

  const priceIndex = React.useMemo(() => {
    const map = new Map<string, PricingMatrixRow>();
    for (const row of cityMatrix) {
      map.set([...row.option_value_ids].sort().join("|") + "#" + row.quantity, row);
    }
    return map;
  }, [cityMatrix]);

  const selectedPricingKey = React.useMemo(
    () => optionValueIds.filter((id) => pricingRelevantIds.has(id)).sort().join("|"),
    [optionValueIds, pricingRelevantIds]
  );

  // Exact tier match, else interpolate from the highest tier <= qty (per-unit price).
  const lookupPrice = React.useCallback(
    (qty: number): { price: number; max_completion_minutes: number | null } | null => {
      if (!Number.isFinite(qty) || qty <= 0) return null;
      const exact = priceIndex.get(selectedPricingKey + "#" + qty);
      if (exact) return { price: exact.price, max_completion_minutes: exact.max_completion_minutes };
      let floor: PricingMatrixRow | null = null;
      for (const t of tiers) {
        if (t > qty) break;
        const row = priceIndex.get(selectedPricingKey + "#" + t);
        if (row) floor = row;
      }
      if (!floor) return null;
      const price = Math.round((floor.price / floor.quantity) * qty * 100) / 100;
      return { price, max_completion_minutes: floor.max_completion_minutes };
    },
    [priceIndex, selectedPricingKey, tiers]
  );

  const tierPrices = React.useMemo(() => {
    const out: Record<number, PriceLookupResult | null> = {};
    for (const qty of tiers) {
      const r = lookupPrice(qty);
      out[qty] = r
        ? { quantity: qty, price: r.price, max_completion_minutes: r.max_completion_minutes, selected_options: [] }
        : null;
    }
    return out;
  }, [lookupPrice, tiers]);

  const priceLookup = React.useMemo<PriceLookupResult | null>(() => {
    const r = lookupPrice(quantity);
    if (!r) return null;
    const selected_options = product.options
      .flatMap((option) => {
        const val = selectedOptions[option.id];
        if (!val || (Array.isArray(val) && val.length === 0)) return [];
        if (Array.isArray(val)) {
          return val.map(v => {
            const value = option.values.find(ov => ov.field_option_value_id === v);
            return { option_label: option.label, value_label: value?.value ?? "", field_option_value_id: v };
          });
        }
        const value = option.values.find(v => v.field_option_value_id === val);
        if (!value) return [];
        return [{ option_label: option.label, value_label: value.value, field_option_value_id: val }];
      });
    return { quantity, price: r.price, max_completion_minutes: r.max_completion_minutes, selected_options };
  }, [lookupPrice, quantity, product.options, selectedOptions]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  function handleCustomUnitChange(nextUnit: DimensionUnit) {
    setCustomWidth((w) => (w ? String(convertDimension(Number(w), customUnit, nextUnit)) : w));
    setCustomHeight((h) => (h ? String(convertDimension(Number(h), customUnit, nextUnit)) : h));
    setCustomUnit(nextUnit);
  }

  function handleAddToCart() {
    if (!priceLookup) return;

    const selectedOpts = product.options.flatMap((option): { option_label: string; value_label: string; field_option_value_id: string }[] => {
      const val = selectedOptions[option.id];
      if (!val || (Array.isArray(val) && val.length === 0)) return [];
      if (Array.isArray(val)) {
        return val.map(v => {
          const value = option.values.find(ov => ov.field_option_value_id === v);
          return { option_label: option.label, value_label: value?.value ?? "", field_option_value_id: v };
        });
      }
      const value = option.values.find(v => v.field_option_value_id === val);
      return [{ option_label: option.label, value_label: value?.value ?? "", field_option_value_id: val }];
    }).filter((o) => o.field_option_value_id);

    const unitPrice = priceLookup.price / quantity;

    addItem({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] ?? null,
      slug: product.slug,
      quantity,
      unitPrice,
      totalPrice: priceLookup.price,
      selection: {
        options: selectedOpts,
        custom_dimensions: showCustomDimensions
          ? { width: Number(customWidth), height: Number(customHeight), unit: customUnit }
          : undefined,
      },
      artworkFileName: file?.name,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const completion = formatCompletion(priceLookup?.max_completion_minutes ?? null);
  const canAddToCart = !!priceLookup && customDimensionsValid;
  const hasQuantities = product.available_quantities.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Product header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            Bestseller
          </span>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-text">4.9</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{product.name}</h1>
        {product.starting_price != null && (
          <p className="mt-2 text-sm text-text-muted">
            Starting at{" "}
            <span className="font-semibold text-text">
              {formatPrice(product.starting_price)}
            </span>
          </p>
        )}
      </div>

      {/* Quantity tier cards */}
      {hasQuantities && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label>Quantity</Label>
            <span className="text-xs font-medium text-primary">Min {minQty.toLocaleString("en-IN")} pcs</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tiers.map((qty, i) => {
              const tierPrice = tierPrices[qty];
              const isSelected = quantity === qty;
              const tier1Price = tierPrices[tiers[0]];
              let savingsPercent = 0;
              if (i > 0 && tierPrice && tier1Price) {
                const unitPriceTier1 = tier1Price.price / tiers[0];
                const unitPriceThis = tierPrice.price / qty;
                savingsPercent = Math.round((1 - unitPriceThis / unitPriceTier1) * 100);
              }
              return (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={cn(
                    "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-surface hover:border-primary/40"
                  )}
                >
                  {savingsPercent > 0 && (
                    <span className="absolute -top-2.5 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Save {savingsPercent}%
                    </span>
                  )}
                  <span className="text-xl font-bold text-text">{qty.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-text-muted">pcs</span>
                  <span className="mt-1 text-sm font-semibold text-text">
                    {tierPrice ? formatPrice(tierPrice.price) : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom quantity input */}
      <div>
        <div className="flex h-11 w-full max-w-xs items-center rounded-md border border-border">
          <button
            className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(minQty, q - minQty))}
            disabled={quantity <= minQty}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={minQty}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(minQty, Number(e.target.value) || minQty))}
            className="h-full w-full flex-1 border-x border-border bg-background text-center text-sm font-medium text-text focus-ring"
            aria-label="Quantity"
          />
          <button
            className="flex h-full w-11 items-center justify-center text-text-muted transition-colors hover:text-primary"
            onClick={() => setQuantity((q) => q + minQty)}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {hasQuantities && (
          <p className="mt-1.5 text-xs text-text-muted">Custom quantity in steps of {minQty.toLocaleString("en-IN")}</p>
        )}
      </div>

      {/* Dynamic product options */}
      <div className="space-y-4">
        {product.options.map((option) => (
          <div key={option.id}>
            <Label className="mb-2 block">
              {option.label}
              {option.is_required ? "" : " (Optional)"}
            </Label>
            {option.field_type === "multi_select" ? (
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => {
                  const selected = ((selectedOptions[option.id] as string[]) ?? []).includes(val.field_option_value_id);
                  return (
                    <button
                      key={val.field_option_value_id}
                      type="button"
                      onClick={() => {
                        setSelectedOptions((prev) => {
                          const current = (prev[option.id] as string[]) ?? [];
                          const next = selected
                            ? current.filter(v => v !== val.field_option_value_id)
                            : [...current, val.field_option_value_id];
                          return { ...prev, [option.id]: next };
                        });
                      }}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-border text-text hover:border-primary/50"
                      )}
                    >
                      {val.value}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Select
                value={(selectedOptions[option.id] as string) ?? ""}
                onValueChange={(v) =>
                  setSelectedOptions((prev) => ({ ...prev, [option.id]: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {option.values.map((val) => (
                    <SelectItem key={val.field_option_value_id} value={val.field_option_value_id}>
                      {val.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}

        {/* Custom dimensions */}
        {showCustomDimensions && (
          <div>
            <Label className="mb-2 block">Custom Size</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  aria-label="Custom width"
                />
              </div>
              <span className="text-sm text-text-muted">×</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  aria-label="Custom height"
                />
              </div>
              <Select value={customUnit} onValueChange={(v) => handleCustomUnitChange(v as DimensionUnit)}>
                <SelectTrigger className="w-20 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!customDimensionsValid && (
              <p className="mt-1.5 text-xs text-danger">Enter the width and height for your custom size.</p>
            )}
            {customDimensionsValid && customUnit !== "in" && (
              <p className="mt-1.5 text-xs text-text-muted">
                ≈ {convertDimension(Number(customWidth), customUnit, "in")} ×{" "}
                {convertDimension(Number(customHeight), customUnit, "in")} in
              </p>
            )}
            {customDimensionsValid && customUnit === "in" && (
              <p className="mt-1.5 text-xs text-text-muted">
                ≈ {convertDimension(Number(customWidth), customUnit, "cm")} ×{" "}
                {convertDimension(Number(customHeight), customUnit, "cm")} cm
              </p>
            )}
          </div>
        )}
      </div>

      {/* Artwork upload */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Upload Your Design</Label>
          {guidelines.length > 0 && (
            <button
              type="button"
              onClick={() => setGuidelinesOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Info className="size-3.5" /> Guidelines
            </button>
          )}
        </div>
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:border-primary/40"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
        >
          <Upload className="size-8 text-text-muted" />
          {file ? (
            <span className="flex items-center gap-2 text-sm font-medium text-text">
              <FileText className="size-4" /> {file.name}
            </span>
          ) : (
            <>
              <span className="text-sm font-medium text-text">
                Drag & drop your file here, or <span className="text-primary">browse</span>
              </span>
              <span className="text-xs text-text-muted">PDF, AI, PSD, PNG, JPG (up to 50MB)</span>
            </>
          )}
          <input type="file" className="hidden" accept=".pdf,.ai,.eps,.psd,.png,.jpg,.jpeg" onChange={handleFileChange} />
        </label>
      </div>

      {/* Price display */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-text mb-3">Order Summary</h3>

        {priceLookup && (
          <dl className="flex flex-col gap-2 text-sm">
            {/* Selected options summary */}
            {(priceLookup.selected_options ?? []).map((opt) => (
              <div key={opt.field_option_value_id} className="flex justify-between">
                <dt className="text-text-muted">{opt.option_label}</dt>
                <dd className="text-text font-medium">{opt.value_label}</dd>
              </div>
            ))}

            <div className="flex justify-between">
              <dt className="text-text-muted">Quantity</dt>
              <dd className="text-text font-medium">{quantity.toLocaleString("en-IN")} pcs</dd>
            </div>

            <div className="flex justify-between border-t border-border pt-3 mt-1">
              <dt className="font-semibold text-text">Total</dt>
              <dd className="font-bold text-lg text-text">{formatPrice(priceLookup.price)}</dd>
            </div>
            <p className="text-[11px] text-text-muted">
              {formatPrice(priceLookup.price / quantity)} per unit · Inclusive of taxes
            </p>
          </dl>
        )}

        {!priceLookup && (
          <p className="text-sm text-text-muted">Select options and quantity to see pricing.</p>
        )}

        {completion && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <Clock className="size-3.5" /> Estimated production time: {completion}
          </p>
        )}
        <p className="mt-1 text-[11px] text-text-muted">Final price confirmed at checkout.</p>
      </div>

      {/* CTA buttons */}
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

      {/* Trust badges */}
      <TrustBadges />

      {/* Guidelines drawer */}
      <Sheet open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Design guidelines</SheetTitle>
            <p className="text-sm text-text-muted">Follow these to make sure your file prints exactly as you expect.</p>
          </SheetHeader>
          <div className="space-y-5">
            {guidelines.map((g, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {g.icon_url ? (
                    <Image src={g.icon_url} alt={g.title} width={24} height={24} className="size-6 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-text">{i + 1}. {g.title}</h4>
                  <p className="mt-0.5 text-sm text-text-muted">{g.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
