import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Proveedores | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const btsCount = await db.product.count({ where: { supplier: "BTSWHOLESALER", active: true } });

  const suppliers = [
    {
      id: "BTSWHOLESALER",
      name: "BTSWholesaler",
      description: "Mayorista europeo especializado en cosmética, perfumería y cuidado personal. +48.000 productos, envío desde España.",
      products: btsCount,
      status: "active",
      syncSchedule: "Diaria (06:00 UTC)",
      website: "https://www.btswholesaler.com",
      orderMethod: "API REST v2.0",
      emoji: "🧴",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Proveedores</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-[#E8E4DC] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">{s.name}</h2>
                <Badge variant="eco" className="mt-1">Activo</Badge>
              </div>
              <span className="text-3xl">{s.emoji}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos activos</span>
                <span className="font-medium">{s.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sincronización</span>
                <span className="font-medium">{s.syncSchedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedidos</span>
                <span className="font-medium">{s.orderMethod}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/sync">Sincronizar ahora</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={s.website} target="_blank" rel="noopener noreferrer">Ver sitio ↗</a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#F5F0E8] rounded-xl p-6">
        <h2 className="font-semibold mb-3">⚙️ Variables de entorno necesarias</h2>
        <div className="space-y-1 text-sm font-mono text-muted-foreground">
          <p><span className="text-[#2D5016] font-semibold">BTS_API_URL</span> — URL base de la API (desde tu dashboard BTSWholesaler)</p>
          <p><span className="text-[#2D5016] font-semibold">BTS_API_TOKEN</span> — JWT token de autenticación</p>
          <p><span className="text-[#2D5016] font-semibold">BTS_MARKUP_FACTOR</span> — Factor de margen (por defecto 1.8 = 80% margen)</p>
          <p><span className="text-[#2D5016] font-semibold">CRON_SECRET</span> — Secreto para el cron de sincronización automática</p>
        </div>
      </div>
    </div>
  );
}
