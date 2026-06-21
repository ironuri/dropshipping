import type { Metadata } from "next";
import { db } from "@/lib/db";
import { parseDecimal, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Pedidos | Admin" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "eco" | "spf" | "vegan" | "new" | "bestseller" | "sale" | "outline"> = {
  PENDING: "spf",
  CONFIRMED: "new",
  PROCESSING: "vegan",
  SHIPPED: "eco",
  DELIVERED: "default",
  CANCELLED: "destructive",
  REFUNDED: "secondary",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;

  const where = status ? { status: status as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      take: 20,
      skip: (page - 1) * 20,
      orderBy: { createdAt: "desc" },
      include: {
        items: { select: { quantity: true } },
        supplierOrders: { select: { supplier: true, status: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos ({total})</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <a href="/admin/orders" className={`px-3 py-1.5 rounded-full text-sm border ${!status ? "bg-primary text-primary-foreground border-transparent" : "border-input hover:bg-muted"}`}>
          Todos
        </a>
        {statuses.map((s) => (
          <a key={s} href={`/admin/orders?status=${s}`} className={`px-3 py-1.5 rounded-full text-sm border ${status === s ? "bg-primary text-primary-foreground border-transparent" : "border-input hover:bg-muted"}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F0E8]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pedido</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Proveedores</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#E8E4DC] hover:bg-[#FAFAF8]">
                <td className="px-4 py-3 font-medium font-mono">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p>{order.shippingName}</p>
                  <p className="text-xs text-muted-foreground">{order.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.createdAt.toLocaleDateString("es-ES")}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatPrice(parseDecimal(order.total))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusColors[order.status] || "default"}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {order.supplierOrders.map((so, i) => (
                      <span key={i} className="text-xs">
                        {so.supplier}: <span className="font-medium">{so.status}</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
