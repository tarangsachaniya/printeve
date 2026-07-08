"use client";

import * as React from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "printeve_cart";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, selectionKey: string, quantity: number, totalPrice: number) => void;
  updateItem: (oldKey: string, item: CartItem) => void;
  removeItem: (productId: string, selectionKey: string) => void;
  clear: () => void;
  selectionKey: (item: CartItem) => string;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function makeKey(item: CartItem): string {
  const optionsKey = [...(item.selection.options ?? [])]
    .map((o) => o.field_option_value_id)
    .sort()
    .join("|");

  const dims = item.selection.custom_dimensions;
  const dimsKey = dims ? `${dims.width}x${dims.height}${dims.unit}` : "";

  return [item.productId, optionsKey, dimsKey].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = React.useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = makeKey(item);
      const existing = prev.find((p) => makeKey(p) === key);
      if (existing) {
        return prev.map((p) =>
          makeKey(p) === key
            ? {
                ...p,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                artworkFileName: item.artworkFileName ?? p.artworkFileName,
              }
            : p
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = React.useCallback(
    (productId: string, selectionKey: string, quantity: number, totalPrice: number) => {
      setItems((prev) =>
        prev.map((p) =>
          p.productId === productId && makeKey(p) === selectionKey
            ? { ...p, quantity, totalPrice }
            : p
        )
      );
    },
    []
  );

  const updateItem = React.useCallback((oldKey: string, item: CartItem) => {
    setItems((prev) => {
      const withoutOld = prev.filter((p) => makeKey(p) !== oldKey);
      const newKey = makeKey(item);
      if (withoutOld.some((p) => makeKey(p) === newKey)) {
        return withoutOld.map((p) => (makeKey(p) === newKey ? item : p));
      }
      return [...withoutOld, item];
    });
  }, []);

  const removeItem = React.useCallback((productId: string, selectionKey: string) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && makeKey(p) === selectionKey)));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const itemCount = items.length;
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const value = React.useMemo(
    () => ({ items, itemCount, subtotal, addItem, updateQuantity, updateItem, removeItem, clear, selectionKey: makeKey }),
    [items, itemCount, subtotal, addItem, updateQuantity, updateItem, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
