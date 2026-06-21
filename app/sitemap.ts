import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecosolar.es";

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terminos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/categorias/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
