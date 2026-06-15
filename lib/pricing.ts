import type { CustomField, PriceBreakdown, Product, QuantitySlab, VariantOption } from "./types";

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
  custom_fields?: Record<string, string | string[]>;
}

/** Mirrors the server's calculateCustomFieldModifiers: sums selected/default option price modifiers. */
function calculateCustomFieldModifiers(
  customFields: CustomField[],
  selection?: Record<string, string | string[]>,
): { total: number; rows: { category_field_id: string; label: string; amount: number }[] } {
  let total = 0;
  const rows: { category_field_id: string; label: string; amount: number }[] = [];

  for (const field of customFields) {
    const selected = selection?.[field.category_field_id];

    if (field.field_type === "multi_select") {
      const ids = Array.isArray(selected) ? selected : [];
      let amount = 0;
      for (const id of ids) {
        const option = field.options.find((o) => o.id === id);
        if (option) amount += Number(option.price_modifier);
      }
      if (amount !== 0) rows.push({ category_field_id: field.category_field_id, label: field.label, amount });
      total += amount;
      continue;
    }

    if (field.field_type === "select" || field.field_type === "boolean") {
      const id = typeof selected === "string" ? selected : undefined;
      let option = id ? field.options.find((o) => o.id === id) ?? null : null;
      if (!option) {
        option = field.options.find((o) => o.is_default) ?? null;
      }
      const amount = option ? Number(option.price_modifier) : 0;
      if (amount !== 0 && option) rows.push({ category_field_id: field.category_field_id, label: field.label, amount });
      total += amount;
      continue;
    }
    // number / text fields carry no price impact
  }

  return { total, rows };
}

/** Client-side estimate mirroring the server PricingService formula, used for instant feedback before the API confirms. */
export function estimatePrice(product: Product, selection: PriceSelection): PriceBreakdown | null {
  const slab = findSlab(product.quantity_slabs, selection.quantity);
  if (product.quantity_slabs.length > 0 && !slab) return null;

  const size = findOption(product.paper_sizes, selection.paper_size_id);
  let quality = findOption(product.paper_qualities, selection.paper_quality_id);
  if (!quality && product.paper_qualities.length > 0) {
    quality = product.paper_qualities.find((q) => q.is_default) ?? product.paper_qualities[0] ?? null;
  }
  const type = findOption(product.paper_types, selection.paper_type_id);

  if (product.paper_sizes.length > 0 && !size) return null;
  if (product.paper_types.length > 0 && !type) return null;
  if (product.paper_qualities.length > 0 && !quality) return null;

  const basePrice = Number(product.base_price);
  const sizeMod = size ? Number(size.price_modifier) : 0;
  const qualityMod = quality ? Number(quality.price_modifier) : 0;
  const typeMod = type ? Number(type.price_modifier) : 0;
  const slabMod = slab ? Number(slab.price_modifier ?? 0) : 0;
  const customFields = calculateCustomFieldModifiers(product.custom_fields ?? [], selection.custom_fields);

  const unitPrice = basePrice + sizeMod + qualityMod + typeMod + slabMod + customFields.total;

  return {
    quantity: selection.quantity,
    base_unit_price: basePrice,
    modifiers: {
      paper_size: size ? { id: size.id, name: size.name, amount: sizeMod } : null,
      paper_quality: quality ? { id: quality.id, name: quality.name, amount: qualityMod } : null,
      paper_type: type ? { id: type.id, name: type.name, amount: typeMod } : null,
      quantity_slab: slab ? { amount: slabMod } : null,
      custom_fields: customFields.rows,
    },
    unit_price: unitPrice,
    total_price: unitPrice * selection.quantity,
    matched_slab: slab ? { min_qty: slab.min_qty, max_qty: slab.max_qty } : null,
    max_completion_minutes: slab?.max_completion_minutes ?? null,
  };
}

export function defaultOption(options: VariantOption[]): VariantOption | undefined {
  return options.find((o) => o.is_default) ?? options[0];
}
