"use client";

import * as React from "react";
import { api } from "./api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

export function useCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get<{ items: Category[] }>("/categories")
      .then((res) => setCategories(res.items ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
