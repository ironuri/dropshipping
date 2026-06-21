"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { FilterState, Product } from "@/types";

interface Props {
  initialProducts: Product[];
  total: number;
  brands: string[];
  currentPage: number;
  pageSize: number;
}

export function ProductCatalog({ initialProducts, total, brands, currentPage, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters: FilterState = {
    brands: searchParams.getAll("brand"),
    categories: searchParams.getAll("category"),
    isEco: searchParams.get("eco") === "true" ? true : undefined,
    isVegan: searchParams.get("vegan") === "true" ? true : undefined,
    isCrueltyFree: searchParams.get("cruelty") === "true" ? true : undefined,
    priceMin: searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined,
    priceMax: searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined,
    spfMin: searchParams.get("spf") ? parseInt(searchParams.get("spf")!) : undefined,
    supplier: (searchParams.get("supplier") as FilterState["supplier"]) || undefined,
    sortBy: (searchParams.get("sort") as FilterState["sortBy"]) || "newest",
    page: currentPage,
  };

  const applyFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    newFilters.brands.forEach((b) => params.append("brand", b));
    if (newFilters.isEco) params.set("eco", "true");
    if (newFilters.isVegan) params.set("vegan", "true");
    if (newFilters.isCrueltyFree) params.set("cruelty", "true");
    if (newFilters.priceMin !== undefined) params.set("priceMin", String(newFilters.priceMin));
    if (newFilters.priceMax !== undefined) params.set("priceMax", String(newFilters.priceMax));
    if (newFilters.spfMin !== undefined) params.set("spf", String(newFilters.spfMin));
    if (newFilters.supplier) params.set("supplier", newFilters.supplier);
    if (newFilters.sortBy !== "newest") params.set("sort", newFilters.sortBy);
    if (newFilters.page > 1) params.set("page", String(newFilters.page));
    router.push(`/productos?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <FilterSidebar
          filters={filters}
          onFiltersChange={applyFilters}
          brands={brands}
          maxPrice={200}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={(f) => { applyFilters(f); setMobileFilterOpen(false); }}
                  brands={brands}
                  maxPrice={200}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Ordenar por:
            </span>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => applyFilters({ ...filters, sortBy: v as FilterState["sortBy"], page: 1 })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="bestseller">Más vendidos</SelectItem>
                <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters chips */}
        {(filters.brands.length > 0 || filters.isEco || filters.isVegan) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.brands.map((b) => (
              <button
                key={b}
                onClick={() => applyFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })}
                className="inline-flex items-center gap-1 bg-[#F5F0E8] rounded-full px-3 py-1 text-xs font-medium"
              >
                {b} <X className="h-3 w-3" />
              </button>
            ))}
            {filters.isEco && (
              <button
                onClick={() => applyFilters({ ...filters, isEco: undefined })}
                className="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium"
              >
                Eco <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <ProductGrid products={initialProducts} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => applyFilters({ ...filters, page: currentPage - 1 })}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilters({ ...filters, page: currentPage + 1 })}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
