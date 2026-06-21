import type { Metadata } from "next";
import { db } from "@/lib/db";
import { parseDecimal, formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard | Admin" };

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayOrders, weekOrders, monthOrders, totalProducts, lowStock, recentOrders] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } }, select: { total: true } }),
    db.order.findMany({ where: { createdAt: { gte: startOfWeek }, status: { not: "CANCELLED" } }, select: { total: true } }),
    db.order.findMany({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, select: { total: true } }),
    db.product.count({ where: { active: true } }),
    db.product.findMany({ where: { stock: { lte: 5, gt: 0 }, active: true }, select: { nameEs: true, sku: true, stock: true }, orderBy: { stock: "asc" }, take: 5 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { orderNumber: true, email: true, total: true, status: true, createdAt: true } }),
  ]);

  const sum = (orders: Array<{ total: unknown }>) =>
    orders.reduce((s, o) => s + parseDecimal(o.total), 0);

  return {
    todayRevenue: sum(todayOrders),
    weekRevenue: sum(weekOrders),
    monthRevenue: sum(monthOrders),
    todayOrders: todayOrders.length,
    totalProducts,
    lowStock,
    recentOrders,
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Ventas hoy", value: formatPrice(stats.todayRevenue), icon: DollarSign, sub: `${stats.todayOrders} pedidos` },
          { label: "Ventas semana", value: formatPrice(stats.weekRevenue), icon: TrendingUp, sub: "Últimos 7 días" },
          { label: "Ventas mes", value: formatPrice(stats.monthRevenue), icon: ShoppingCart, sub: "Este mes" },
          { label: "Productos activos", value: stats.totalProducts.toString(), icon: Package, sub: "En catálogo" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E8E4DC] p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-5 w-5 text-[#2D5016]" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E4DC] p-6">
          <h2 className="font-semibold mb-4">Pedidos recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E4DC]">
                  <th className="text-left py-2 font-medium text-muted-foreground">Pedido</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.orderNumber} className="border-b border-[#E8E4DC] last:border-0">
                    <td className="py-3 font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-muted-foreground">{order.email}</td>
                    <td className="py-3">{formatPrice(parseDecimal(order.total))}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">Stock bajo</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin alertas 👍</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <div key={p.sku} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{p.nameEs}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{p.stock} uds.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
