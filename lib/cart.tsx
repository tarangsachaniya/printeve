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
  removeItem: (productId: string, selectionKey: string) => void;
  clear: () => void;
  selectionKey: (item: CartItem) => string;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function makeKey(item: CartItem): string {
  const customFields = item.selection.custom_fields ?? {};
  const customFieldsKey = Object.keys(customFields)
    .sort()
    .map((id) => {
      const value = customFields[id].value;
      return `${id}=${Array.isArray(value) ? [...value].sort().join(",") : value}`;
    })
    .join("|");

  return [
    item.productId,
    item.selection.paper_size?.id ?? "",
    item.selection.paper_quality?.id ?? "",
    item.selection.paper_type?.id ?? "",
    customFieldsKey,
  ].join("::");
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

  const removeItem = React.useCallback((productId: string, selectionKey: string) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && makeKey(p) === selectionKey)));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const value = React.useMemo(
    () => ({ items, itemCount, subtotal, addItem, updateQuantity, removeItem, clear, selectionKey: makeKey }),
    [items, itemCount, subtotal, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
