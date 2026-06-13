import {
  CreditCard,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Flag,
  Tag,
  Package,
  Megaphone,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  {
    slug: "business-cards",
    name: "Business Cards",
    description: "Premium finishes that make a strong first impression",
    icon: CreditCard,
  },
  {
    slug: "flyers",
    name: "Flyers",
    description: "Eye-catching flyers for promotions and events",
    icon: FileText,
  },
  {
    slug: "brochures",
    name: "Brochures",
    description: "Multi-fold brochures that tell your story",
    icon: BookOpen,
  },
  {
    slug: "posters",
    name: "Posters",
    description: "Large-format posters with vibrant, sharp print",
    icon: ImageIcon,
  },
  {
    slug: "banners",
    name: "Banners",
    description: "Durable indoor and outdoor banners",
    icon: Flag,
  },
  {
    slug: "stickers",
    name: "Stickers",
    description: "Custom-shaped stickers and labels",
    icon: Tag,
  },
  {
    slug: "packaging",
    name: "Packaging Prints",
    description: "Branded boxes, mailers and packaging inserts",
    icon: Package,
  },
  {
    slug: "marketing-materials",
    name: "Marketing Materials",
    description: "Catalogues, letterheads and promotional kits",
    icon: Megaphone,
  },
  {
    slug: "bulk-printing",
    name: "Bulk Printing",
    description: "High-volume orders with volume discounts",
    icon: Layers,
  },
];
