"use client";

import Link from "next/link";
import { Palette, FileText } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";

export default function SavedDesignsPage() {
  const { items } = useCart();
  const designs = items.filter((item) => item.artworkFileName);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-text">Saved Designs</h2>
        <p className="text-sm text-text-muted">Artwork files you&apos;ve uploaded for your orders.</p>
      </div>

      {designs.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface">
            <Palette className="size-6 text-text-muted" />
          </div>
          <h3 className="text-base font-semibold text-text">No saved designs yet</h3>
          <p className="max-w-sm text-sm text-text-muted">
            Upload artwork when configuring a product and it will appear here for quick reordering.
          </p>
          <Button asChild className="mt-2">
            <Link href="/products">Browse Products</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((item, idx) => (
            <Card key={idx} className="flex flex-col gap-3 p-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-surface">
                <ProductImage src={item.image} alt={item.name} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{item.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <FileText className="size-3.5" /> {item.artworkFileName}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/products/${item.slug}`}>Reorder</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
