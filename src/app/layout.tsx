import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BUSINESS_CONFIG } from "@/config/business";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${BUSINESS_CONFIG.name} - Wholesale Dress Materials & Suits Surat`,
  description: `${BUSINESS_CONFIG.tagline}. Direct Surat Manufacturer PWA Catalogue with Exclusive Password-Protected Boutique Suits.`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BUSINESS_CONFIG.name,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: BUSINESS_CONFIG.colors.primary,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans bg-bg-main text-text-primary">
        {children}
      </body>
    </html>
  );
}
