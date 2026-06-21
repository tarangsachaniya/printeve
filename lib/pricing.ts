// Pricing is now handled entirely by the API via matrix lookup.
// This file is kept as a placeholder for the defaultOption helper used by other components.

import type { ProductOption } from "./types";

export function defaultOptionValue(option: ProductOption): string | undefined {
  const def = option.values.find((v) => v.is_default);
  return def?.field_option_value_id ?? option.values[0]?.field_option_value_id;
}
