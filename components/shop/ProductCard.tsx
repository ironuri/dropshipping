"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice, getSpfBadgeLabel, parseDecimal } from "@/lib/utils";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => s.isWishlisted);
  const wishlisted = isWishlisted(product.id);

  const price = parseDecimal(product.retailPrice);
  const compareAt = product.compareAtPrice ? parseDecimal(product.compareAtPrice) : null;
  const spfLabel = getSpfBadgeLabel(product.spf);
  const image = product.images[0];
  const isOutOfStock = product.stock === 0;
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : null;

  return (
    <article className="group relative bg-white rounded-lg border border-[#E8E4DC] hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/productos/${product.slug}`} className="relative aspect-square bg-[#FAFAF8] overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.altEs}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
            🧴
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && <Badge variant="sale">-{discount}%</Badge>}
          {product.isEco && <Badge variant="eco">ECO</Badge>}
          {product.isVegan && <Badge variant="vegan">VEGANO</Badge>}
          {spfLabel && <Badge variant="spf">{spfLabel}</Badge>}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Sin stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {product.brand && (
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">
            {product.brand}
          </p>
        )}
        <Link href={`/productos/${product.slug}`}>
          <h3 className="text-sm font-medium leading-snug hover:text-[#2D5016] transition-colors line-clamp-2">
            {product.nameEs}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-auto">
          <span className="font-bold text-lg">{formatPrice(price)}</span>
          {compareAt && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            {isOutOfStock ? "Sin stock" : "Añadir"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn("shrink-0 h-9 w-9", wishlisted && "text-red-500 border-red-200")}
            onClick={() => toggle(product)}
            aria-label={wishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </Button>
        </div>
      </div>
    </article>
  );
}
