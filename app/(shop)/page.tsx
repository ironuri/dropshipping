import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryBanner } from "@/components/home/CategoryBanner";
import { TrustBadges } from "@/components/home/TrustBadges";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { Suspense } from "react";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Feliu Cosmetics | Solares y Cosmética Natural Premium",
  description:
    "Tienda online de protección solar de farmacia y cosméticos naturales eco-certificados. ISDIN, Heliocare, La Roche-Posay, Biosolis. Envío gratis +35€.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <CategoryBanner />
      <Suspense fallback={<div className="container py-16"><ProductGrid products={[]} loading /></div>}>
        <FeaturedProducts />
      </Suspense>
      <NewsletterSignup />
    </>
  );
}
