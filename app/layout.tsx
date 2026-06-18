import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { CityProvider } from "@/lib/city";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CityPickerDialog } from "@/components/layout/city-picker-dialog";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrintEve — Premium Custom Printing",
  description:
    "Business cards, flyers, brochures, posters, banners, stickers, packaging and bulk printing — designed, printed and delivered with precision.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, categories] = await Promise.all([
    getSiteConfig(),
    api.get<{ items: Category[] }>("/categories").then(r => r.items ?? []).catch(() => []),
  ]);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text">
        <AuthProvider>
          <CartProvider>
            <CityProvider>
              <SiteHeader siteConfig={config} categories={categories} />
              <main className="flex-1">{children}</main>
              <SiteFooter siteConfig={config} categories={categories} />
              <CityPickerDialog />
            </CityProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
