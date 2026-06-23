import { btswholesalerAdapter } from "./btswholesaler";
import type { SupplierAdapter } from "@/types";

export const suppliers: Record<string, SupplierAdapter> = {
  BTSWHOLESALER: btswholesalerAdapter,
};

export function getSupplierAdapter(supplier: string): SupplierAdapter {
  const adapter = suppliers[supplier];
  if (!adapter) throw new Error(`Unknown supplier: ${supplier}`);
  return adapter;
}
