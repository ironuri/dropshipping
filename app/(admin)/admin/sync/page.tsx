"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Download, Search, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncStats {
  pagesProcessed: number;
  productsScanned: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export default function BTSSyncPage() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runSync = useCallback(async (dryRun: boolean) => {
    setSyncing(true);
    setStats(null);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dryRun) params.set("dryRun", "true");
      const res = await fetch(`/api/sync/btswholesaler?${params}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en sincronización");
      setStats(data);
      setLastRun(new Date().toLocaleString("es-ES"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sincronización BTSWholesaler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Importa y actualiza el catálogo desde BTSWholesaler API v2.0
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => runSync(true)} disabled={syncing}>
            <Search className="h-4 w-4 mr-2" />
            Dry run
          </Button>
          <Button
            size="sm"
            onClick={() => runSync(false)}
            disabled={syncing}
            className="bg-[#2D5016] hover:bg-[#3D6A20] text-white"
          >
            {syncing
              ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Sincronizando…</>
              : <><Download className="h-4 w-4 mr-2" />Sincronizar catálogo</>
            }
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Error de sincronización</p>
            <p>{error}</p>
            {error.includes("BTS_API") && (
              <p className="mt-2 text-xs">
                Añade <code className="bg-red-100 px-1 rounded">BTS_API_URL</code> y{" "}
                <code className="bg-red-100 px-1 rounded">BTS_API_TOKEN</code> en Vercel → Settings → Environment Variables.
              </p>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="mb-6 p-5 rounded-xl bg-[#F5F0E8] border border-[#E8E4DC]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-[#2D5016]" />
            <h3 className="font-semibold text-sm">
              Resultado {stats.pagesProcessed > 0 ? "" : "(dry run)"}
              {lastRun && <span className="font-normal text-muted-foreground ml-2">· {lastRun}</span>}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              { label: "Páginas",      value: stats.pagesProcessed },
              { label: "Escaneados",   value: stats.productsScanned },
              { label: "Creados",      value: stats.created,  color: "text-green-600" },
              { label: "Actualizados", value: stats.updated,  color: "text-blue-600"  },
              { label: "Omitidos",     value: stats.skipped,  color: "text-muted-foreground" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-[#E8E4DC]">
                <p className={`text-2xl font-bold ${color ?? ""}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {stats.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-red-600 mb-1">{stats.errors.length} errores:</p>
              <ul className="text-xs text-red-500 space-y-0.5 max-h-32 overflow-y-auto font-mono">
                {stats.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Dry run",           desc: "Simula la sincronización sin escribir en la base de datos. Muestra cuántos productos se crearían.", icon: Search },
          { title: "Sincronizar",       desc: "Importa todos los productos del catálogo BTS que mapeen a nuestras categorías. Hasta 10 000 productos por ejecución.", icon: Download },
          { title: "Cron automático",   desc: "Se ejecuta cada día a las 06:00 UTC mediante Vercel Cron. Requiere CRON_SECRET configurado.", icon: RefreshCw },
        ].map(({ title, desc, icon: Icon }) => (
          <div key={title} className="bg-white rounded-xl border border-[#E8E4DC] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-[#2D5016]" />
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* Env vars checklist */}
      <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-[#2D5016]" />
          <h2 className="font-semibold">Variables de entorno requeridas</h2>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { key: "BTS_API_URL",       desc: "URL base de la API (desde tu dashboard BTSWholesaler)", required: true  },
            { key: "BTS_API_TOKEN",     desc: "JWT token de autenticación",                            required: true  },
            { key: "BTS_MARKUP_FACTOR", desc: "Factor de margen sobre precio coste (default: 1.8)",   required: false },
            { key: "CRON_SECRET",       desc: "Secreto para el cron de sincronización automática",     required: true  },
          ].map(({ key, desc, required }) => (
            <div key={key} className="flex items-start gap-3 py-2 border-b border-[#F5F0E8] last:border-0">
              <code className="text-xs bg-[#F5F0E8] text-[#2D5016] px-2 py-0.5 rounded font-mono shrink-0">{key}</code>
              <span className="text-muted-foreground flex-1">{desc}</span>
              <span className={`text-xs shrink-0 ${required ? "text-red-500" : "text-muted-foreground"}`}>
                {required ? "Requerida" : "Opcional"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
