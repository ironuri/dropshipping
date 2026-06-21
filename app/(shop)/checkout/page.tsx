"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getShippingCost, parseDecimal, SPANISH_PROVINCES } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import Image from "next/image";
import { Shield, Lock } from "lucide-react";

interface CheckoutForm {
  email: string;
  name: string;
  street: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  shippingMethod: "standard" | "express";
}

export default function CheckoutPage() {
  const { items, clearCart, subtotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    email: "", name: "", street: "", apartment: "",
    city: "", province: "", postalCode: "", phone: "",
    shippingMethod: "standard",
  });

  const sub = subtotal();
  const shipping = form.shippingMethod === "express" ? 6.99 : getShippingCost(sub);
  const tax = sub * 0.21;
  const total = sub + shipping;

  const set = (k: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...form,
          subtotal: sub,
          shippingCost: shipping,
          total,
        }),
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Error al procesar el pago");
      }
    } catch (err) {
      toast({
        title: "Error en el pago",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (!items.length) {
    router.push("/carrito");
    return null;
  }

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="font-semibold text-lg mb-4">Información de contacto</h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="tu@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+34 600 000 000" className="mt-1" />
                </div>
              </div>
            </section>

            <Separator />

            {/* Shipping address */}
            <section>
              <h2 className="font-semibold text-lg mb-4">Dirección de envío</h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" required value={form.name} onChange={set("name")} placeholder="María García López" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="street">Dirección</Label>
                  <Input id="street" required value={form.street} onChange={set("street")} placeholder="Calle Mayor, 1" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="apartment">Piso, puerta, etc. (opcional)</Label>
                  <Input id="apartment" value={form.apartment} onChange={set("apartment")} placeholder="3º Izq." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="postalCode">Código postal</Label>
                    <Input id="postalCode" required value={form.postalCode} onChange={set("postalCode")} placeholder="08001" pattern="[0-9]{5}" maxLength={5} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="city">Localidad</Label>
                    <Input id="city" required value={form.city} onChange={set("city")} placeholder="Barcelona" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Select value={form.province} onValueChange={(v) => setForm((f) => ({ ...f, province: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPANISH_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Shipping method */}
            <section>
              <h2 className="font-semibold text-lg mb-4">Método de envío</h2>
              <div className="space-y-2">
                {[
                  { id: "standard", label: "Envío estándar", sublabel: "3-5 días laborables", price: getShippingCost(sub) },
                  { id: "express", label: "Envío express", sublabel: "24-48h laborables", price: 6.99 },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${form.shippingMethod === method.id ? "border-[#2D5016] bg-[#F5F0E8]" : "border-[#E8E4DC] hover:border-[#4A7C2F]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={form.shippingMethod === method.id as "standard" | "express"}
                        onChange={() => setForm((f) => ({ ...f, shippingMethod: method.id as "standard" | "express" }))}
                        className="text-[#2D5016]"
                      />
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-muted-foreground">{method.sublabel}</p>
                      </div>
                    </div>
                    <span className="font-bold">
                      {method.price === 0 ? "Gratis" : formatPrice(method.price)}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="bg-[#F5F0E8] rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Tu pedido</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const price = parseDecimal(item.product.retailPrice);
                  const img = item.product.images[0];
                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-md border border-[#E8E4DC] bg-white shrink-0 overflow-hidden">
                        {img && <Image src={img.url} alt={img.altEs} fill className="object-contain p-1" sizes="56px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.product.nameEs}</p>
                        <p className="text-xs text-muted-foreground">Cant. {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <Separator className="bg-[#E8E4DC] mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(sub)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IVA (21%)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
              </div>
              <Separator className="bg-[#E8E4DC] my-4" />
              <div className="flex justify-between font-bold text-xl mb-6">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading || !form.province}>
                <Lock className="h-4 w-4" />
                {loading ? "Procesando…" : "Pagar con Stripe"}
              </Button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Pago 100% seguro con cifrado SSL</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
