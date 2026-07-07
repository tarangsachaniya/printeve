import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { BuyNowProvider } from "@/lib/buy-now";
import { CityProvider } from "@/lib/city";
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
            <BuyNowProvider>
              <CityProvider>
                {children}
                <CityPickerDialog />
                <Toaster position="top-right" richColors closeButton />
              </CityProvider>
            </BuyNowProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

