"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Search, Eye, Download, ChevronDown, ChevronRight, CheckSquare, Square, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BBCategoryNode {
  id: string;
  name: string;
  ourSlug: string | null;
  children: BBCategoryNode[];
}

interface PreviewProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  price: number;
  retailPrice: number;
  compareAtPrice: number;
  stock: number;
  images: string[];
  categoryNames: string[];
}

interface SyncStats {
  pagesProcessed: number;
  productsScanned: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// ─── Category tree node ───────────────────────────────────────────────────────

function CategoryNode({
  node,
  depth = 0,
  selected,
  onToggle,
  onPreview,
}: {
  node: BBCategoryNode;
  depth?: number;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onPreview: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selected.has(node.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#F5F0E8] text-sm group"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {node.children.length > 0 ? (
          <button onClick={() => setExpanded((v) => !v)} className="text-muted-foreground shrink-0">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        <button onClick={() => onToggle(node.id)} className="shrink-0 text-[#2D5016]">
          {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}
        </button>

        <span className="flex-1 truncate">{node.name}</span>

        {node.ourSlug && (
          <span className="hidden group-hover:inline-flex text-xs px-1.5 py-0.5 rounded bg-[#2D5016]/10 text-[#2D5016] shrink-0">
            → {node.ourSlug}
          </span>
        )}

        <button
          onClick={() => onPreview(node.id, node.name)}
          className="hidden group-hover:inline-flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0"
        >
          <Eye className="h-3 w-3" /> Ver
        </button>
      </div>

      {expanded && node.children.map((child) => (
        <CategoryNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selected={selected}
          onToggle={onToggle}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BigBuySyncPage() {
  const [categories, setCategories] = useState<BBCategoryNode[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<PreviewProduct[]>([]);
  const [previewTitle, setPreviewTitle] = useState("");
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);

  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load category tree
  const loadCategories = useCallback(async () => {
    setLoadingCats(true);
    setError(null);
    try {
      const res = await fetch("/api/bigbuy/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando categorías");
      setCategories(data.tree);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingCats(false);
    }
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Preview products for a category
  const loadPreview = useCallback(async (categoryId: string, name: string) => {
    setLoadingPreview(true);
    setPreviewTitle(name);
    setPreview([]);
    setError(null);
    try {
      const res = await fetch(`/api/bigbuy/preview?categoryId=${categoryId}&page=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando preview");
      setPreview(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // Trigger sync
  const runSync = useCallback(async (dryRun = false) => {
    setSyncing(true);
    setSyncStats(null);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dryRun) params.set("dryRun", "true");
      const res = await fetch(`/api/sync/bigbuy?${params}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en sincronización");
      setSyncStats(data);
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
          <h1 className="text-2xl font-bold">Sincronización BigBuy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Importa y actualiza productos desde el catálogo BigBuy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => runSync(true)} disabled={syncing}>
            <Search className="h-4 w-4 mr-2" />
            Dry run
          </Button>
          <Button size="sm" onClick={() => runSync(false)} disabled={syncing} className="bg-[#2D5016] hover:bg-[#3D6A20] text-white">
            {syncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {syncing ? "Sincronizando…" : "Sincronizar todo"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Sync result */}
      {syncStats && (
        <div className="mb-6 p-4 rounded-lg bg-[#F5F0E8] border border-[#E8E4DC]">
          <h3 className="font-semibold text-sm mb-3">Resultado de sincronización</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            {[
              { label: "Páginas", value: syncStats.pagesProcessed },
              { label: "Escaneados", value: syncStats.productsScanned },
              { label: "Creados", value: syncStats.created, color: "text-green-600" },
              { label: "Actualizados", value: syncStats.updated, color: "text-blue-600" },
              { label: "Omitidos", value: syncStats.skipped, color: "text-muted-foreground" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-[#E8E4DC]">
                <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {syncStats.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-600 mb-1">{syncStats.errors.length} errores:</p>
              <ul className="text-xs text-red-500 space-y-0.5 max-h-32 overflow-y-auto">
                {syncStats.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category explorer */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Categorías BigBuy</h2>
            <Button size="sm" variant="outline" onClick={loadCategories} disabled={loadingCats}>
              {loadingCats ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Explorar</span>
            </Button>
          </div>

          {selected.size > 0 && (
            <p className="text-xs text-[#2D5016] mb-3">{selected.size} categoría(s) seleccionada(s)</p>
          )}

          {categories.length === 0 && !loadingCats && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Haz clic en &quot;Explorar&quot; para cargar las categorías de BigBuy</p>
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto -mx-2">
            {categories.map((node) => (
              <CategoryNode
                key={node.id}
                node={node}
                selected={selected}
                onToggle={toggleCategory}
                onPreview={loadPreview}
              />
            ))}
          </div>
        </div>

        {/* Product preview */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-6">
          <h2 className="font-semibold mb-4">
            Vista previa {previewTitle ? `· ${previewTitle}` : ""}
          </h2>

          {loadingPreview && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-[#2D5016]" />
            </div>
          )}

          {!loadingPreview && preview.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Haz clic en &quot;Ver&quot; junto a una categoría para previsualizar sus productos</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#E8E4DC]">
                    <th className="text-left py-2 font-medium text-muted-foreground">Imagen</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Producto</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Coste</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">PVP</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p) => (
                    <tr key={p.id} className="border-b border-[#E8E4DC] last:border-0">
                      <td className="py-2">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-[#F5F0E8] rounded flex items-center justify-center text-base">🌿</div>
                        )}
                      </td>
                      <td className="py-2 max-w-[160px]">
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        <p className="text-muted-foreground">{p.brand} · {p.sku}</p>
                      </td>
                      <td className="py-2 text-right text-muted-foreground">{p.price.toFixed(2)}€</td>
                      <td className="py-2 text-right font-medium text-[#2D5016]">{p.retailPrice.toFixed(2)}€</td>
                      <td className="py-2 text-right">
                        <span className={p.stock > 10 ? "text-green-600" : p.stock > 0 ? "text-amber-600" : "text-red-500"}>
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {preview.length} producto(s) en esta página
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
