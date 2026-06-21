import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseDecimal, truncate } from "@/lib/utils";
import { ProductDetail } from "./ProductDetail";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { nameEs: true, descriptionEs: true, brand: true, images: { take: 1 } },
  });

  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.nameEs} | ${product.brand || "EcoSolar"}`,
    description: truncate(product.descriptionEs, 155),
    openGraph: {
      title: `${product.nameEs} | EcoSolar Cosmetics`,
      description: truncate(product.descriptionEs, 155),
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const raw = await db.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!raw) notFound();

  const product: Product = {
    ...raw,
    costPrice: parseDecimal(raw.costPrice),
    retailPrice: parseDecimal(raw.retailPrice),
    compareAtPrice: raw.compareAtPrice ? parseDecimal(raw.compareAtPrice) : null,
    categories: raw.categories.map((pc) => pc.category),
  } as unknown as Product;

  // Related products
  const relatedRaw = await db.product.findMany({
    where: {
      active: true,
      brand: product.brand || undefined,
      id: { not: product.id },
    },
    take: 4,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      categories: { include: { category: true } },
    },
  });

  const related = relatedRaw.map((p) => ({
    ...p,
    costPrice: parseDecimal(p.costPrice),
    retailPrice: parseDecimal(p.retailPrice),
    compareAtPrice: p.compareAtPrice ? parseDecimal(p.compareAtPrice) : null,
    categories: p.categories.map((pc) => pc.category),
  })) as unknown as Product[];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEs,
    description: product.descriptionEs,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => i.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.retailPrice.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "EcoSolar Cosmetics" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}
