import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Proveedores | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const [bigbuyCount, dietisurCount] = await Promise.all([
    db.product.count({ where: { supplier: "BIGBUY", active: true } }),
    db.product.count({ where: { supplier: "DIETISUR", active: true } }),
  ]);

  const suppliers = [
    {
      id: "BIGBUY",
      name: "BigBuy",
      description: "Marketplace europeo con +200.000 productos de farmacia y cosmética premium.",
      products: bigbuyCount,
      status: "active",
      syncSchedule: "Cada 6 horas",
      website: "https://bigbuy.eu",
      orderMethod: "API REST",
    },
    {
      id: "DIETISUR",
      name: "DietiSur",
      description: "Especialista en cosmética eco y natural. Catálogo de marcas como Biosolis, Florame y Dr. Hauschka.",
      products: dietisurCount,
      status: "active",
      syncSchedule: "Cada hora (CSV)",
      website: "https://dietisur.es",
      orderMethod: "Email automático",
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
                <Badge variant={s.status === "active" ? "eco" : "secondary"} className="mt-1">
                  {s.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <span className="text-3xl">{s.id === "BIGBUY" ? "🏭" : "🌿"}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Productos activos</span><span className="font-medium">{s.products}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sincronización</span><span className="font-medium">{s.syncSchedule}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pedidos</span><span className="font-medium">{s.orderMethod}</span></div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/api/sync/${s.id.toLowerCase()}`}>
                  Sincronizar ahora
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={s.website} target="_blank" rel="noopener noreferrer">
                  Ver sitio ↗
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#F5F0E8] rounded-xl p-6">
        <h2 className="font-semibold mb-3">⚙️ Configuración de sincronización</h2>
        <p className="text-sm text-muted-foreground">
          Las sincronizaciones automáticas están configuradas mediante Vercel Cron Jobs.
          BigBuy se sincroniza cada 6 horas. DietiSur (CSV) se sincroniza cada hora.
          Para forzar una sincronización manual, usa los botones de arriba (requiere header <code>Authorization: Bearer CRON_SECRET</code>).
        </p>
      </div>
    </div>
  );
}
