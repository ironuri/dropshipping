"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { FilterState } from "@/types";

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  brands: string[];
  maxPrice: number;
}

export function FilterSidebar({ filters, onFiltersChange, brands, maxPrice }: Props) {
  const toggle = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value, page: 1 });

  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands, page: 1 });
  };

  const reset = () =>
    onFiltersChange({
      brands: [],
      categories: [],
      isEco: undefined,
      isVegan: undefined,
      isCrueltyFree: undefined,
      priceMin: undefined,
      priceMax: undefined,
      spfMin: undefined,
      spfMax: undefined,
      supplier: undefined,
      sortBy: "newest",
      page: 1,
    });

  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.isEco ||
    filters.isVegan ||
    filters.isCrueltyFree ||
    filters.priceMin !== undefined ||
    filters.supplier !== undefined;

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <button onClick={reset} className="text-xs text-[#2D5016] hover:underline">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Price range */}
      <section className="mb-6">
        <p className="text-sm font-medium mb-3">Precio</p>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={[filters.priceMin ?? 0, filters.priceMax ?? maxPrice]}
          onValueChange={([min, max]) =>
            onFiltersChange({ ...filters, priceMin: min, priceMax: max, page: 1 })
          }
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.priceMin ?? 0)}</span>
          <span>{formatPrice(filters.priceMax ?? maxPrice)}</span>
        </div>
      </section>

      <Separator className="mb-6" />

      {/* SPF */}
      <section className="mb-6">
        <p className="text-sm font-medium mb-3">Factor de protección</p>
        {[50, 30, 20].map((spf) => (
          <div key={spf} className="flex items-center gap-2 mb-2">
            <Checkbox
              id={`spf-${spf}`}
              checked={(filters.spfMin ?? 0) >= spf}
              onCheckedChange={(checked) =>
                toggle("spfMin", checked ? spf : undefined)
              }
            />
            <Label htmlFor={`spf-${spf}`} className="text-sm cursor-pointer">
              SPF {spf}+
            </Label>
          </div>
        ))}
      </section>

      <Separator className="mb-6" />

      {/* Certifications */}
      <section className="mb-6">
        <p className="text-sm font-medium mb-3">Certificaciones</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="eco"
              checked={!!filters.isEco}
              onCheckedChange={(c) => toggle("isEco", c ? true : undefined)}
            />
            <Label htmlFor="eco" className="text-sm cursor-pointer">🌿 Eco / Natural</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="vegan"
              checked={!!filters.isVegan}
              onCheckedChange={(c) => toggle("isVegan", c ? true : undefined)}
            />
            <Label htmlFor="vegan" className="text-sm cursor-pointer">🌱 Vegano</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cruelty"
              checked={!!filters.isCrueltyFree}
              onCheckedChange={(c) => toggle("isCrueltyFree", c ? true : undefined)}
            />
            <Label htmlFor="cruelty" className="text-sm cursor-pointer">🐰 Cruelty-free</Label>
          </div>
        </div>
      </section>

      <Separator className="mb-6" />

      {/* Supplier */}
      <section className="mb-6">
        <p className="text-sm font-medium mb-3">Proveedor</p>
        <div className="space-y-2">
          {(["BIGBUY", "DIETISUR"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox
                id={s}
                checked={filters.supplier === s}
                onCheckedChange={(c) => toggle("supplier", c ? s : undefined)}
              />
              <Label htmlFor={s} className="text-sm cursor-pointer">
                {s === "BIGBUY" ? "Farmacia Premium" : "Eco & Natural"}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-6" />

      {/* Brands */}
      {brands.length > 0 && (
        <section className="mb-6">
          <p className="text-sm font-medium mb-3">Marcas</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">{brand}</Label>
              </div>
            ))}
          </div>
        </section>
      )}

      <Button className="w-full" onClick={reset} variant="outline">
        Restablecer filtros
      </Button>
    </aside>
  );
}
