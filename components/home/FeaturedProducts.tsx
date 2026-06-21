import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { db } from "@/lib/db";
import { parseDecimal } from "@/lib/utils";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    where: { active: true, featured: true },
    take: 8,
    include: {
      images: { orderBy: { position: "asc" } },
      categories: { include: { category: true } },
    },
    orderBy: { salesCount: "desc" },
  });

  return products.map((p) => ({
    ...p,
    costPrice: parseDecimal(p.costPrice),
    retailPrice: parseDecimal(p.retailPrice),
    compareAtPrice: p.compareAtPrice ? parseDecimal(p.compareAtPrice) : null,
    categories: p.categories.map((pc) => pc.category),
  })) as unknown as Product[];
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Más vendidos</h2>
          <p className="text-muted-foreground mt-1">Los favoritos de nuestra comunidad</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/productos">Ver todos</Link>
        </Button>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">Próximamente</p>
      )}
    </section>
  );
}
