"use client";

import * as React from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "printeve_buy_now_item";

interface BuyNowContextValue {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  clear: () => void;
}

const BuyNowContext = React.createContext<BuyNowContextValue | null>(null);

export function BuyNowProvider({ children }: { children: React.ReactNode }) {
  const [item, setItemState] = React.useState<CartItem | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
      if (raw) setItemState(JSON.parse(raw));
    } catch {
      // ignore corrupt data
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (item) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(item));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [item, hydrated]);

  const setItem = React.useCallback((next: CartItem) => setItemState(next), []);
  const clear = React.useCallback(() => setItemState(null), []);

  const value = React.useMemo(() => ({ item, setItem, clear }), [item, setItem, clear]);

  return <BuyNowContext.Provider value={value}>{children}</BuyNowContext.Provider>;
}

export function useBuyNow() {
  const ctx = React.useContext(BuyNowContext);
  if (!ctx) throw new Error("useBuyNow must be used within BuyNowProvider");
  return ctx;
}
