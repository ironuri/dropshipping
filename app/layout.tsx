import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/layout/CookieBanner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "EcoSolar Cosmetics | Solares y Cosmética Natural",
    template: "%s | EcoSolar Cosmetics",
  },
  description:
    "Tienda online de cosmética solar y natural. Marcas premium: ISDIN, Heliocare, La Roche-Posay, Biosolis, Florame. Envío gratis en pedidos +35€.",
  keywords: [
    "crema solar",
    "cosmética natural",
    "ISDIN",
    "Heliocare",
    "protector solar",
    "SPF50",
    "eco solar",
    "skincare",
    "vitamina C",
    "niacinamida",
  ],
  authors: [{ name: "EcoSolar Cosmetics" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "EcoSolar Cosmetics",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="es">
      <body className={inter.className}>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        {children}
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}
