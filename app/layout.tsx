import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text">
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
