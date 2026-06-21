"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPrice, getShippingCost, parseDecimal } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal } = useCart();
  const sub = subtotal();
  const shipping = getShippingCost(sub);
  const total = sub + shipping;
  const freeShippingThreshold = 35;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito ({items.reduce((s, i) => s + i.quantity, 0)} artículos)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 opacity-20" />
            <p>Tu carrito está vacío</p>
            <Button variant="outline" onClick={() => setIsOpen(false)} asChild>
              <Link href="/productos">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {sub < freeShippingThreshold && (
              <div className="bg-[#F5F0E8] rounded-md p-3 mx-0 mt-4">
                <p className="text-xs text-[#2D5016] font-medium">
                  Te faltan {formatPrice(freeShippingThreshold - sub)} para envío gratis 🚚
                </p>
                <div className="mt-2 h-1.5 bg-[#E8E4DC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2D5016] rounded-full transition-all"
                    style={{ width: `${Math.min((sub / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const price = parseDecimal(item.product.retailPrice);
                const img = item.product.images[0];
                return (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative h-20 w-20 rounded-md border border-[#E8E4DC] bg-[#FAFAF8] shrink-0 overflow-hidden">
                      {img && (
                        <Image
                          src={img.url}
                          alt={img.altEs}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/productos/${item.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium hover:text-[#2D5016] line-clamp-2"
                      >
                        {item.product.nameEs}
                      </Link>
                      <p className="text-sm font-bold mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className={shipping === 0 ? "text-[#2D5016] font-medium" : ""}>
                  {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total (IVA inc.)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full mt-2" size="lg" asChild onClick={() => setIsOpen(false)}>
                <Link href="/checkout">Finalizar compra</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)} asChild>
                <Link href="/carrito">Ver carrito completo</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
