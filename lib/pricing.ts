import type { PriceBreakdown, Product, QuantitySlab, VariantOption } from "./types";

function findSlab(slabs: QuantitySlab[], quantity: number): QuantitySlab | null {
  return slabs.find((s) => quantity >= s.min_qty && (s.max_qty == null || quantity <= s.max_qty)) ?? null;
}

function findOption(options: VariantOption[], id: string | undefined): VariantOption | null {
  if (!id) return null;
  return options.find((o) => o.id === id) ?? null;
}

export interface PriceSelection {
  paper_size_id: string;
  paper_quality_id?: string;
  paper_type_id: string;
  quantity: number;
}

/** Client-side estimate mirroring the server PricingService formula, used for instant feedback before the API confirms. */
export function estimatePrice(product: Product, selection: PriceSelection): PriceBreakdown | null {
  const slab = findSlab(product.quantity_slabs, selection.quantity);
  if (!slab) return null;

  const size = findOption(product.paper_sizes, selection.paper_size_id);
  let quality = findOption(product.paper_qualities, selection.paper_quality_id);
  if (!quality && product.paper_qualities.length > 0) {
    quality = product.paper_qualities.find((q) => q.is_default) ?? product.paper_qualities[0] ?? null;
  }
  const type = findOption(product.paper_types, selection.paper_type_id);

  if (!size || !type) return null;
  if (product.paper_qualities.length > 0 && !quality) return null;

  const basePrice = Number(product.base_price);
  const sizeMod = Number(size.price_modifier);
  const qualityMod = quality ? Number(quality.price_modifier) : 0;
  const typeMod = Number(type.price_modifier);
  const slabMod = Number(slab.price_modifier ?? 0);

  const unitPrice = basePrice + sizeMod + qualityMod + typeMod + slabMod;

  return {
    quantity: selection.quantity,
    base_unit_price: basePrice,
    modifiers: {
      paper_size: { id: size.id, name: size.name, amount: sizeMod },
      paper_quality: quality ? { id: quality.id, name: quality.name, amount: qualityMod } : null,
      paper_type: { id: type.id, name: type.name, amount: typeMod },
      quantity_slab: { amount: slabMod },
    },
    unit_price: unitPrice,
    total_price: unitPrice * selection.quantity,
    matched_slab: { min_qty: slab.min_qty, max_qty: slab.max_qty },
    max_completion_minutes: slab.max_completion_minutes ?? null,
  };
}

export function defaultOption(options: VariantOption[]): VariantOption | undefined {
  return options.find((o) => o.is_default) ?? options[0];
}
