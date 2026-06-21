"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { formatPrice } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchBar({ open, onClose }: Props) {
  const { query, results, isLoading, search, close } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else close();
  }, [open, close]);

  const handleClose = () => {
    close();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Buscar productos, marcas, ingredientes…"
            className="border-0 shadow-none focus-visible:ring-0 text-base h-auto py-1"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && !isLoading && (
              <p className="p-8 text-center text-muted-foreground text-sm">
                No hay resultados para &quot;{query}&quot;
              </p>
            )}
            {results.map((product) => (
              <Link
                key={product.objectID}
                href={`/productos/${product.slug}`}
                onClick={handleClose}
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F0E8] transition-colors"
              >
                <div className="relative h-14 w-14 rounded-md bg-[#FAFAF8] border border-[#E8E4DC] shrink-0 overflow-hidden">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.nameEs}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {product.brand && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
                  )}
                  <p className="text-sm font-medium line-clamp-1">{product.nameEs}</p>
                  <p className="text-sm font-bold text-[#2D5016]">{formatPrice(product.retailPrice)}</p>
                </div>
              </Link>
            ))}
            {results.length > 0 && (
              <Link
                href={`/productos?q=${encodeURIComponent(query)}`}
                onClick={handleClose}
                className="block text-center text-sm text-[#2D5016] hover:underline py-3 border-t"
              >
                Ver todos los resultados ({results.length}+)
              </Link>
            )}
          </div>
        )}

        {!query && (
          <div className="p-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Búsquedas populares</p>
            <div className="flex flex-wrap gap-2">
              {["ISDIN SPF50", "vitamina C serum", "Biosolis eco solar", "crema solar niños", "niacinamida"].map((term) => (
                <button
                  key={term}
                  onClick={() => search(term)}
                  className="text-sm px-3 py-1.5 rounded-full bg-[#F5F0E8] hover:bg-[#E8E4DC] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
