import React from "react";
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

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: React.ElementType<any>;
}

export const categories: Category[] = [
  {
    slug: "business-cards",
    name: "Business Cards",
    description: "Premium finishes that make a strong first impression",
    icon: BusinessCardSVG,
  },
  {
    slug: "flyers",
    name: "Flyers",
    description: "Eye-catching flyers for promotions and events",
    icon: FlyerSVG,
  },
  {
    slug: "brochures",
    name: "Brochures",
    description: "Multi-fold brochures that tell your story",
    icon: BrochureSVG,
  },
  {
    slug: "posters",
    name: "Posters",
    description: "Large-format posters with vibrant, sharp print",
    icon: PosterSVG,
  },
  {
    slug: "banners",
    name: "Banners",
    description: "Durable indoor and outdoor banners",
    icon: BannerSVG,
  },
  {
    slug: "stickers",
    name: "Stickers",
    description: "Custom-shaped stickers and labels",
    icon: StickerSVG,
  },
  {
    slug: "packaging",
    name: "Packaging Prints",
    description: "Branded boxes, mailers and packaging inserts",
    icon: PackagingSVG,
  },
  {
    slug: "marketing-materials",
    name: "Marketing Materials",
    description: "Catalogues, letterheads and promotional kits",
    icon: MarketingKitSVG,
  },
  {
    slug: "bulk-printing",
    name: "Bulk Printing",
    description: "High-volume orders with volume discounts",
    icon: BulkPrintingSVG,
  },
];
