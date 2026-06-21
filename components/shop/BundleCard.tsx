"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatPrice, parseDecimal } from "@/lib/utils";
import type { Bundle, Product } from "@/types";
import { toast } from "@/hooks/useToast";

interface Props {
  bundle: Bundle & {
    items: Array<{ product: Product; quantity: number }>;
    retailPrice: number;
  };
}

export function BundleCard({ bundle }: Props) {
  const addItem = useCart((s) => s.addItem);

  const addBundleToCart = () => {
    bundle.items.forEach(({ product, quantity }) => {
      for (let i = 0; i < quantity; i++) addItem(product, 1);
    });
    toast({ title: "Bundle añadido", description: `${bundle.name} añadido al carrito` });
  };

  const originalTotal = bundle.items.reduce((s, { product, quantity }) =>
    s + parseDecimal(product.retailPrice) * quantity, 0);

  const discountedPrice = bundle.retailPrice || originalTotal * (1 - parseDecimal(bundle.discount) / 100);

  return (
    <article className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2D5016] to-[#4A7C2F] p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-[#D4A853] text-[#1A1A1A] mb-2">BUNDLE -{parseDecimal(bundle.discount)}%</Badge>
            <h3 className="font-bold text-lg">{bundle.name}</h3>
            {bundle.description && <p className="text-white/80 text-sm mt-1">{bundle.description}</p>}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4 space-y-3">
        {bundle.items.map(({ product }) => {
          const img = product.images[0];
          return (
            <div key={product.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-md border border-[#E8E4DC] bg-[#FAFAF8] shrink-0 overflow-hidden">
                {img && <Image src={img.url} alt={img.altEs} fill className="object-contain p-1" sizes="48px" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/productos/${product.slug}`} className="text-sm font-medium hover:text-[#2D5016] line-clamp-1">
                  {product.nameEs}
                </Link>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
              <span className="text-sm font-medium">{formatPrice(parseDecimal(product.retailPrice))}</span>
            </div>
          );
        })}
      </div>

      {/* Price + CTA */}
      <div className="p-4 border-t border-[#E8E4DC] flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground line-through">{formatPrice(originalTotal)}</p>
          <p className="text-xl font-bold text-[#2D5016]">{formatPrice(discountedPrice)}</p>
        </div>
        <Button onClick={addBundleToCart} className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          Añadir bundle
        </Button>
      </div>
    </article>
  );
}
