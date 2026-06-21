import { bigbuyAdapter } from "./bigbuy";
import { dietisurAdapter } from "./dietisur";
import type { SupplierAdapter } from "@/types";

export const suppliers: Record<string, SupplierAdapter> = {
  BIGBUY: bigbuyAdapter,
  DIETISUR: dietisurAdapter,
};

export function getSupplierAdapter(supplier: string): SupplierAdapter {
  const adapter = suppliers[supplier];
  if (!adapter) throw new Error(`Unknown supplier: ${supplier}`);
  return adapter;
}
