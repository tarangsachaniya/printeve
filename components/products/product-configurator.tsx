"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Clock, CheckCircle2, FileText, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import type { Product, PriceBreakdown, DimensionUnit } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { estimatePrice, defaultOption } from "@/lib/pricing";
import { useCart } from "@/lib/cart";
import { useCity } from "@/lib/city";
import { formatPrice, cn } from "@/lib/utils";
import { convertDimension, isCustomSize, DIMENSION_UNITS } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

  const [sizeId, setSizeId] = React.useState(defaultOption(product.paper_sizes)?.id ?? "");
  const [customWidth, setCustomWidth] = React.useState("");
  const [customHeight, setCustomHeight] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState<DimensionUnit>("cm");
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

  const [customFieldValues, setCustomFieldValues] = React.useState<Record<string, string | string[]>>(() => {
    const initial: Record<string, string | string[]> = {};
    for (const field of product.custom_fields ?? []) {
      if (field.field_type === "multi_select") {
        initial[field.product_field_id] = [];
      } else if (field.field_type === "select" || field.field_type === "boolean" || field.field_type === "radio") {
        const def = field.options.find((o) => o.is_default) ?? field.options[0];
        if (def) initial[field.product_field_id] = def.id;
      }
    }
    return initial;
  });
  const [customFieldText, setCustomFieldText] = React.useState<Record<string, string>>({});

  const selection = React.useMemo(
    () => ({
      paper_size_id: sizeId,
      paper_quality_id: qualityId || undefined,
      paper_type_id: typeId,
      quantity,
      city_id: cityId || undefined,
      custom_fields: customFieldValues,
    }),
    [sizeId, qualityId, typeId, quantity, cityId, customFieldValues]
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
        const data = await api.post<PriceBreakdown>(`/products/${product.slug}/price`, selection);
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
  }, [sizeId, typeId, qualityId, quantity, cityId, customFieldValues, product.id]);

  const showCustomDimensions = isCustomSize(product.paper_sizes.find((s) => s.id === sizeId)?.name);
  const customDimensionsValid =
    !showCustomDimensions || (Number(customWidth) > 0 && Number(customHeight) > 0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleCustomUnitChange(nextUnit: DimensionUnit) {
    setCustomWidth((w) => (w ? String(convertDimension(Number(w), customUnit, nextUnit)) : w));
    setCustomHeight((h) => (h ? String(convertDimension(Number(h), customUnit, nextUnit)) : h));
    setCustomUnit(nextUnit);
  }

  function handleAddToCart() {
    if (!breakdown) return;

    const size = product.paper_sizes.find((s) => s.id === sizeId);
    const type = product.paper_types.find((t) => t.id === typeId);
    const quality = product.paper_qualities.find((q) => q.id === qualityId);

    const customFields: Record<string, { value: string | string[]; label: string; modifier: number }> = {};
    for (const field of product.custom_fields ?? []) {
      if (field.field_type === "select" || field.field_type === "boolean" || field.field_type === "radio") {
        const id = customFieldValues[field.product_field_id] as string | undefined;
        const opt = field.options.find((o) => o.id === id) ?? field.options.find((o) => o.is_default);
        if (opt) {
          customFields[field.product_field_id] = {
            value: opt.id,
            label: `${field.label}: ${opt.name}`,
            modifier: Number(opt.price_modifier),
          };
        }
      } else if (field.field_type === "multi_select") {
        const ids = (customFieldValues[field.product_field_id] as string[]) ?? [];
        const opts = field.options.filter((o) => ids.includes(o.id));
        if (opts.length > 0) {
          customFields[field.product_field_id] = {
            value: ids,
            label: `${field.label}: ${opts.map((o) => o.name).join(", ")}`,
            modifier: opts.reduce((sum, o) => sum + Number(o.price_modifier), 0),
          };
        }
      } else {
        const text = customFieldText[field.product_field_id];
        if (text) {
          customFields[field.product_field_id] = { value: text, label: `${field.label}: ${text}`, modifier: 0 };
        }
      }
    }

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
        custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
        custom_dimensions: showCustomDimensions
          ? { width: Number(customWidth), height: Number(customHeight), unit: customUnit }
          : undefined,
      },
      artworkFileName: file?.name,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const completion = formatCompletion(breakdown?.max_completion_minutes ?? null);
  const matchedSlab = breakdown?.matched_slab;
  const canAddToCart = !!breakdown && !priceError && customDimensionsValid;

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

      {/* Product custom fields */}
      {(product.custom_fields ?? []).map((field) => {
        if (field.field_type === "select" || field.field_type === "boolean") {
          const value = (customFieldValues[field.product_field_id] as string) ?? "";
          return (
            <div key={field.product_field_id}>
              <Label className="mb-2 block">
                {field.label}
                {field.is_required ? " *" : ""}
              </Label>
              <Select
                value={value}
                onValueChange={(v) =>
                  setCustomFieldValues((prev) => ({ ...prev, [field.product_field_id]: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                      {opt.price_modifier !== 0 &&
                        ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.field_type === "radio") {
          const value = (customFieldValues[field.product_field_id] as string) ?? "";
          return (
            <div key={field.product_field_id}>
              <Label className="mb-2 block">
                {field.label}
                {field.is_required ? " *" : ""}
              </Label>
              <div className="flex flex-col gap-2">
                {field.options.map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm text-text cursor-pointer">
                    <input
                      type="radio"
                      name={field.product_field_id}
                      value={opt.id}
                      checked={value === opt.id}
                      onChange={() =>
                        setCustomFieldValues((prev) => ({ ...prev, [field.product_field_id]: opt.id }))
                      }
                      className="size-4 accent-primary"
                    />
                    {opt.name}
                    {opt.price_modifier !== 0 &&
                      ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.field_type === "multi_select") {
          const values = (customFieldValues[field.product_field_id] as string[]) ?? [];
          return (
            <div key={field.product_field_id}>
              <Label className="mb-2 block">
                {field.label}
                {field.is_required ? " *" : ""}
              </Label>
              <div className="flex flex-col gap-2">
                {field.options.map((opt) => {
                  const checked = values.includes(opt.id);
                  return (
                    <label key={opt.id} className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setCustomFieldValues((prev) => {
                            const current = (prev[field.product_field_id] as string[]) ?? [];
                            const next = e.target.checked
                              ? [...current, opt.id]
                              : current.filter((id) => id !== opt.id);
                            return { ...prev, [field.product_field_id]: next };
                          });
                        }}
                        className="size-4 accent-primary"
                      />
                      {opt.name}
                      {opt.price_modifier !== 0 &&
                        ` (${opt.price_modifier > 0 ? "+" : ""}${formatPrice(opt.price_modifier)})`}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        if (field.field_type === "textarea") {
          return (
            <div key={field.product_field_id}>
              <Label className="mb-2 block">
                {field.label}
                {field.is_required ? " *" : ""}
              </Label>
              <textarea
                value={customFieldText[field.product_field_id] ?? ""}
                onChange={(e) =>
                  setCustomFieldText((prev) => ({ ...prev, [field.product_field_id]: e.target.value }))
                }
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus-ring resize-y"
              />
            </div>
          );
        }

        if (field.field_type === "file_upload") {
          return (
            <div key={field.product_field_id}>
              <Label className="mb-2 block">
                {field.label}
                {field.is_required ? " *" : ""}
              </Label>
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setCustomFieldText((prev) => ({ ...prev, [field.product_field_id]: f.name }));
                }}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text focus-ring file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </div>
          );
        }

        return (
          <div key={field.product_field_id}>
            <Label className="mb-2 block">
              {field.label}
              {field.is_required ? " *" : ""}
            </Label>
            <input
              type={field.field_type === "number" ? "number" : "text"}
              value={customFieldText[field.product_field_id] ?? ""}
              onChange={(e) =>
                setCustomFieldText((prev) => ({ ...prev, [field.product_field_id]: e.target.value }))
              }
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text focus-ring"
            />
          </div>
        );
      })}

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
            {breakdown.modifiers.city && breakdown.modifiers.city.amount !== 0 && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Location adjustment</dt>
                <dd className="text-text">{formatPrice(breakdown.modifiers.city.amount)}</dd>
              </div>
            )}
            {breakdown.modifiers.custom_fields?.map((row) => (
              <div key={row.product_field_id} className="flex justify-between">
                <dt className="text-text-muted">{row.label}</dt>
                <dd className="text-text">{formatPrice(row.amount)}</dd>
              </div>
            ))}
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
