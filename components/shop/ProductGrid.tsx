import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface Props {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#E8E4DC] animate-pulse">
            <div className="aspect-square bg-[#E8E4DC] rounded-t-lg" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-[#E8E4DC] rounded w-1/3" />
              <div className="h-4 bg-[#E8E4DC] rounded" />
              <div className="h-4 bg-[#E8E4DC] rounded w-2/3" />
              <div className="h-8 bg-[#E8E4DC] rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="text-lg">No se encontraron productos</p>
        <p className="text-sm mt-1">Prueba a cambiar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
