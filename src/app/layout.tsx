import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xellbuy — Skincare, Haircare, Makeup & Fragrance",
  description: "Beauty & personal care e-commerce store — skincare, haircare, makeup and fragrance",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
