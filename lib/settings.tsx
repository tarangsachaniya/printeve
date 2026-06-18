"use client";

import * as React from "react";
import { api } from "./api";
import type { Product } from "./types";

export function useNavbarProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get<{ items: Product[] }>("/settings/navbar_products")
      .then((res) => setProducts(res.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
