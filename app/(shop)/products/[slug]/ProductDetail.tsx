"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice, getSpfBadgeLabel, parseDecimal } from "@/lib/utils";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: Props) {
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => s.isWishlisted)(product.id);

  const price = parseDecimal(product.retailPrice);
  const compareAt = product.compareAtPrice ? parseDecimal(product.compareAtPrice) : null;
  const spfLabel = getSpfBadgeLabel(product.spf);
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : null;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/productos" className="hover:text-foreground">Productos</Link>
        {product.categories[0] && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/categorias/${product.categories[0].slug}`} className="hover:text-foreground">
              {product.categories[0].nameEs}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground line-clamp-1">{product.nameEs}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] overflow-hidden group">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage].url}
                alt={product.images[activeImage].altEs}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🧴</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-20 w-20 rounded-lg border-2 shrink-0 overflow-hidden bg-[#FAFAF8] transition-colors",
                    i === activeImage ? "border-[#2D5016]" : "border-[#E8E4DC] hover:border-[#4A7C2F]"
                  )}
                >
                  <Image src={img.url} alt={img.altEs} fill className="object-contain p-1" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wider text-[#6B6B6B]">{product.brand}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.nameEs}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {spfLabel && <Badge variant="spf">{spfLabel}</Badge>}
            {product.isEco && <Badge variant="eco">🌿 ECO</Badge>}
            {product.isVegan && <Badge variant="vegan">🌱 VEGANO</Badge>}
            {product.isCrueltyFree && <Badge variant="eco">🐰 Cruelty-Free</Badge>}
            {discount && <Badge variant="sale">-{discount}% DESCUENTO</Badge>}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {compareAt && (
              <span className="text-lg text-muted-foreground line-through pb-1">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground -mt-4">IVA incluido (21%)</p>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">✗ Sin stock</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium">⚠ Solo quedan {product.stock} unidades</span>
            ) : (
              <span className="text-[#2D5016] font-medium flex items-center gap-1">
                <Check className="h-4 w-4" /> En stock — Envío 24-48h
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E8E4DC] rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-md rounded-r-none"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-md rounded-l-none"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1 gap-2" size="lg" onClick={handleAddToCart}>
                <ShoppingBag className="h-5 w-5" />
                Añadir al carrito
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn("h-11 w-11 shrink-0", isWishlisted && "text-red-500 border-red-200")}
                onClick={() => toggle(product)}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
              </Button>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Descripción</h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{product.descriptionEs}</p>
          </div>

          {/* Ingredients */}
          {product.ingredients && (
            <div>
              <button
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="flex items-center justify-between w-full text-left font-semibold border-t border-[#E8E4DC] pt-4"
              >
                <span>Ingredientes (INCI)</span>
                <ChevronRight className={cn("h-4 w-4 transition-transform", ingredientsOpen && "rotate-90")} />
              </button>
              {ingredientsOpen && (
                <p className="text-xs text-[#6B6B6B] leading-relaxed mt-3 font-mono">
                  {product.ingredients}
                </p>
              )}
            </div>
          )}

          {/* EU regulation notice */}
          <p className="text-xs text-muted-foreground border-t border-[#E8E4DC] pt-4">
            ✓ Cumple Reglamento (CE) 1223/2009 sobre productos cosméticos
          </p>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
