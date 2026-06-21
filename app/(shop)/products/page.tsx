import type { Metadata } from "next";
import { db } from "@/lib/db";
import { parseDecimal } from "@/lib/utils";
import { ProductCatalog } from "./ProductCatalog";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Todos los productos | EcoSolar Cosmetics",
  description: "Catálogo completo de protección solar de farmacia y cosméticos naturales. Filtra por marca, SPF, certificación eco y precio.",
};

export const revalidate = 3600;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = { active: true };

  if (params.brand) where.brand = { in: Array.isArray(params.brand) ? params.brand : [params.brand] };
  if (params.eco === "true") where.isEco = true;
  if (params.vegan === "true") where.isVegan = true;
  if (params.cruelty === "true") where.isCrueltyFree = true;
  if (params.supplier) where.supplier = params.supplier;
  if (params.spf) where.spf = { gte: parseInt(params.spf as string) };
  if (params.priceMin || params.priceMax) {
    where.retailPrice = {};
    if (params.priceMin) (where.retailPrice as Record<string, number>).gte = parseFloat(params.priceMin as string);
    if (params.priceMax) (where.retailPrice as Record<string, number>).lte = parseFloat(params.priceMax as string);
  }

  const page = parseInt((params.page as string) || "1");
  const pageSize = 24;

  const sortMap: Record<string, Record<string, string>> = {
    price_asc: { retailPrice: "asc" },
    price_desc: { retailPrice: "desc" },
    newest: { createdAt: "desc" },
    bestseller: { salesCount: "desc" },
  };
  const orderBy = sortMap[(params.sort as string) || "newest"] || { createdAt: "desc" };

  const [products, total, allBrands] = await Promise.all([
    db.product.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        categories: { include: { category: true } },
      },
    }),
    db.product.count({ where }),
    db.product.findMany({
      where: { active: true },
      select: { brand: true },
      distinct: ["brand"],
    }),
  ]);

  const typedProducts = products.map((p) => ({
    ...p,
    costPrice: parseDecimal(p.costPrice),
    retailPrice: parseDecimal(p.retailPrice),
    compareAtPrice: p.compareAtPrice ? parseDecimal(p.compareAtPrice) : null,
    categories: p.categories.map((pc) => pc.category),
  })) as unknown as Product[];

  const brands = allBrands
    .map((b) => b.brand)
    .filter(Boolean)
    .sort() as string[];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Todos los productos</h1>
        <p className="text-muted-foreground mt-1">{total} productos disponibles</p>
      </div>
      <ProductCatalog
        initialProducts={typedProducts}
        total={total}
        brands={brands}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
