import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { parseDecimal, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Productos | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.q || "";
  const supplier = params.supplier as "BIGBUY" | "DIETISUR" | undefined;

  const where = {
    ...(search && {
      OR: [
        { nameEs: { contains: search, mode: "insensitive" as const } },
        { brand: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(supplier && { supplier }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      take: 20,
      skip: (page - 1) * 20,
      orderBy: { updatedAt: "desc" },
      include: { images: { take: 1 } },
    }),
    db.product.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos ({total})</h1>
      </div>

      {/* Search */}
      <form className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar por nombre, SKU, marca…"
          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
        />
        <select name="supplier" defaultValue={supplier || ""} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
          <option value="">Todos los proveedores</option>
          <option value="BIGBUY">BigBuy</option>
          <option value="DIETISUR">DietiSur</option>
        </select>
        <button type="submit" className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Buscar
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F0E8]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Producto</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Proveedor</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Coste</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">PVP</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#E8E4DC] hover:bg-[#FAFAF8]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt={p.nameEs} className="h-10 w-10 object-contain rounded border border-[#E8E4DC]" />
                    )}
                    <div>
                      <p className="font-medium line-clamp-1">{p.nameEs}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.supplier === "BIGBUY" ? "default" : "eco"} className="text-xs">
                    {p.supplier}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">{formatPrice(parseDecimal(p.costPrice))}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(parseDecimal(p.retailPrice))}</td>
                <td className="px-4 py-3 text-right">
                  <span className={p.stock === 0 ? "text-red-600 font-bold" : p.stock <= 5 ? "text-amber-600 font-bold" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.active ? "default" : "secondary"}>
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {page > 1 && (
          <Link href={`?page=${page - 1}&q=${search}&supplier=${supplier || ""}`} className="px-4 py-2 border rounded-md text-sm">
            Anterior
          </Link>
        )}
        <span className="px-4 py-2 text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 20)}</span>
        {page < Math.ceil(total / 20) && (
          <Link href={`?page=${page + 1}&q=${search}&supplier=${supplier || ""}`} className="px-4 py-2 border rounded-md text-sm">
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}
