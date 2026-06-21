"use client";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPrice, getShippingCost, parseDecimal } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const sub = subtotal();
  const shipping = getShippingCost(sub);
  const tax = sub * 0.21;
  const total = sub + shipping;
  const freeShippingThreshold = 35;

  if (items.length === 0) {
    return (
      <div className="container py-24 flex flex-col items-center gap-6 text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground/20" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">Descubre nuestros productos de cosmética solar y skincare premium.</p>
        <Button asChild>
          <Link href="/productos">Explorar productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Mi carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = parseDecimal(item.product.retailPrice);
            const img = item.product.images[0];
            return (
              <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-lg border border-[#E8E4DC]">
                <Link href={`/productos/${item.product.slug}`} className="relative h-24 w-24 rounded-md border border-[#E8E4DC] bg-[#FAFAF8] shrink-0 overflow-hidden">
                  {img && <Image src={img.url} alt={img.altEs} fill className="object-contain p-2" sizes="96px" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/productos/${item.product.slug}`} className="font-medium hover:text-[#2D5016] line-clamp-2">
                    {item.product.nameEs}
                  </Link>
                  <p className="text-sm font-bold mt-1">{formatPrice(price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[#E8E4DC] rounded">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold">{formatPrice(price * item.quantity)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E8E4DC] p-6">
            <h2 className="font-bold text-lg mb-4">Resumen del pedido</h2>
            {sub < freeShippingThreshold && (
              <div className="bg-[#F5F0E8] rounded-md p-3 mb-4">
                <p className="text-xs text-[#2D5016] font-medium">
                  Te faltan {formatPrice(freeShippingThreshold - sub)} para envío gratis
                </p>
                <div className="mt-2 h-1.5 bg-[#E8E4DC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2D5016] rounded-full" style={{ width: `${Math.min((sub / freeShippingThreshold) * 100, 100)}%` }} />
                </div>
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(sub)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IVA (21%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className={shipping === 0 ? "text-[#2D5016] font-medium" : ""}>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">IVA incluido</p>
            <Button className="w-full mt-4 gap-2" size="lg" asChild>
              <Link href="/checkout">
                Finalizar compra <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>🔒 Pago seguro</span>
              <span>↩ 30 días devolución</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
