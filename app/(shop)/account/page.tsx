import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parseDecimal, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { User, Package, Heart, MapPin, Settings } from "lucide-react";

export const metadata: Metadata = { title: "Mi cuenta | EcoSolar Cosmetics" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { orderNumber: true, status: true, total: true, createdAt: true, items: { select: { quantity: true } } },
  });

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Mi cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { href: "/cuenta/pedidos", icon: Package, label: "Mis pedidos" },
          { href: "/cuenta/favoritos", icon: Heart, label: "Favoritos" },
          { href: "/cuenta/direcciones", icon: MapPin, label: "Direcciones" },
          { href: "/cuenta/ajustes", icon: Settings, label: "Ajustes" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-[#E8E4DC] hover:border-[#2D5016] transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#F5F0E8] flex items-center justify-center">
              <Icon className="h-5 w-5 text-[#2D5016]" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-[#E8E4DC] p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <User className="h-8 w-8 text-[#2D5016]" />
          </div>
          <div>
            <p className="font-semibold text-lg">{session.user.name || "Usuario"}</p>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Pedidos recientes</h2>
          <Link href="/cuenta/pedidos" className="text-sm text-[#2D5016] hover:underline">Ver todos</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aún no tienes pedidos.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.orderNumber} className="flex items-center justify-between py-2 border-b border-[#E8E4DC] last:border-0">
                <div>
                  <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString("es-ES")} · {order.items.reduce((s, i) => s + i.quantity, 0)} artículos</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatPrice(parseDecimal(order.total))}</span>
                  <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
