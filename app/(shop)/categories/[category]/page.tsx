import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseDecimal } from "@/lib/utils";
import { ProductGrid } from "@/components/shop/ProductGrid";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await db.category.findUnique({ where: { slug: category } });
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: `${cat.nameEs} | EcoSolar Cosmetics`,
    description: `Productos de ${cat.nameEs}. Marcas premium y eco-certificadas. Envío gratis en pedidos +35€.`,
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const cat = await db.category.findUnique({
    where: { slug: category },
    include: { parent: true },
  });

  if (!cat) notFound();

  const raw = await db.product.findMany({
    where: {
      active: true,
      categories: { some: { category: { slug: category } } },
    },
    orderBy: { salesCount: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      categories: { include: { category: true } },
    },
  });

  const products = raw.map((p) => ({
    ...p,
    costPrice: parseDecimal(p.costPrice),
    retailPrice: parseDecimal(p.retailPrice),
    compareAtPrice: p.compareAtPrice ? parseDecimal(p.compareAtPrice) : null,
    categories: p.categories.map((pc) => pc.category),
  })) as unknown as Product[];

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        {cat.parent && (
          <>
            <Link href={`/categorias/${cat.parent.slug}`} className="hover:text-foreground">{cat.parent.nameEs}</Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{cat.nameEs}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{cat.nameEs}</h1>
        <p className="text-muted-foreground mt-1">{products.length} productos</p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
