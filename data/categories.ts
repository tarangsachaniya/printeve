import React from "react";
import { Tag } from "lucide-react";
import {
  BusinessCardSVG,
  FlyerSVG,
  BrochureSVG,
  PosterSVG,
  BannerSVG,
  StickerSVG,
  PackagingSVG,
  MarketingKitSVG,
  BulkPrintingSVG,
} from "@/components/ui/custom-svgs";

export const categoryIcons: Record<string, React.ElementType<any>> = {
  "business-cards": BusinessCardSVG,
  "flyers": FlyerSVG,
  "brochures": BrochureSVG,
  "posters": PosterSVG,
  "banners": BannerSVG,
  "stickers": StickerSVG,
  "packaging": PackagingSVG,
  "marketing-materials": MarketingKitSVG,
  "bulk-printing": BulkPrintingSVG,
};

export const categoryDescriptions: Record<string, string> = {
  "business-cards": "Premium finishes that make a strong first impression",
  "flyers": "Eye-catching flyers for promotions and events",
  "brochures": "Multi-fold brochures that tell your story",
  "posters": "Large-format posters with vibrant, sharp print",
  "banners": "Durable indoor and outdoor banners",
  "stickers": "Custom-shaped stickers and labels",
  "packaging": "Branded boxes, mailers and packaging inserts",
  "marketing-materials": "Catalogues, letterheads and promotional kits",
  "bulk-printing": "High-volume orders with volume discounts",
};

export const defaultCategoryIcon: React.ElementType<any> = Tag;
export const defaultCategoryDescription = "Custom printing, made to spec";

export function getCategoryIcon(slug: string): React.ElementType<any> {
  return categoryIcons[slug] ?? defaultCategoryIcon;
}

export function getCategoryDescription(slug: string): string {
  return categoryDescriptions[slug] ?? defaultCategoryDescription;
}
