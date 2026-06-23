/**
 * BTSWholesaler REST API v2.0 adapter
 * Docs: https://www.btswholesaler.com/en/site/api
 *
 * Auth: JWT Bearer token
 * All catalog endpoints: POST with JSON body
 * Base URL: configured in BTS_API_URL env var (from client dashboard)
 */

import type { SupplierAdapter, SupplierProduct, OrderPayload, SupplierOrderResult } from "@/types";

const BASE_URL = (process.env.BTS_API_URL || "").replace(/\/$/, "");
const API_TOKEN = process.env.BTS_API_TOKEN;
const MARKUP   = parseFloat(process.env.BTS_MARKUP_FACTOR || "1.8");
const PAGE_SIZE = 500; // BTS max per page

// ─── Raw BTS API types ────────────────────────────────────────────────────────

export interface BTSProduct {
  id: string;
  sku: string;
  ean?: string;
  name: string;
  description?: string;
  price: number;          // cost price
  pvp?: number;           // suggested retail
  brand?: string;
  stock: number;
  weight?: number;
  volume?: number;
  images?: string[];
  categories?: string[];
  categoryIds?: string[];
  lang?: string;
}

export interface BTSCategory {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface BTSStockItem {
  sku: string;
  stock: number;
  price: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function btsFetch<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
  if (!API_TOKEN) throw new Error("BTS_API_TOKEN is not set");
  if (!BASE_URL)  throw new Error("BTS_API_URL is not set");

  const url = `${BASE_URL}/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ lang: "es", ...body }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`BTS ${res.status} on ${endpoint}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public catalog methods ───────────────────────────────────────────────────

/** Fetch one page of the full product catalog (500 products/page) */
export async function fetchProductsPage(page: number): Promise<BTSProduct[]> {
  const data = await btsFetch<{ products?: BTSProduct[] } | BTSProduct[]>(
    "getListProducts",
    { page, limit: PAGE_SIZE }
  );
  return Array.isArray(data) ? data : (data.products ?? []);
}

/** Fetch only products changed since last sync (incremental update) */
export async function fetchProductChanges(since: string): Promise<BTSProduct[]> {
  const data = await btsFetch<{ products?: BTSProduct[] } | BTSProduct[]>(
    "getProductChanges",
    { since }
  );
  return Array.isArray(data) ? data : (data.products ?? []);
}

/** Real-time stock and pricing for all products */
export async function fetchProductStock(): Promise<BTSStockItem[]> {
  try {
    const data = await btsFetch<{ products?: BTSStockItem[] } | BTSStockItem[]>(
      "getProductStock",
      {}
    );
    return Array.isArray(data) ? data : (data.products ?? []);
  } catch {
    console.warn("[BTS] fetchProductStock failed — proceeding with catalog prices");
    return [];
  }
}

/** Recently added products */
export async function fetchNewProducts(): Promise<BTSProduct[]> {
  const data = await btsFetch<{ products?: BTSProduct[] } | BTSProduct[]>(
    "getNewProducts",
    {}
  );
  return Array.isArray(data) ? data : (data.products ?? []);
}

/** Catalog metadata (total products, last update) */
export async function fetchFeedStatus(): Promise<{ total: number; updatedAt: string }> {
  const res = await fetch(`${BASE_URL}/getFeedStatus`, {
    method: "GET",
    headers: { Authorization: `Bearer ${API_TOKEN}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return { total: 0, updatedAt: "" };
  return res.json();
}

// ─── Category → our slug mapping ─────────────────────────────────────────────

export const BTS_CATEGORY_MAP: Array<{ match: string; ourSlug: string }> = [
  // Línea Solar
  { match: "solar facial",        ourSlug: "solar-facial" },
  { match: "protector solar",     ourSlug: "solar-facial" },
  { match: "protección solar",    ourSlug: "solar-facial" },
  { match: "sun face",            ourSlug: "solar-facial" },
  { match: "facial sun",          ourSlug: "solar-facial" },
  { match: "solar corporal",      ourSlug: "solar-corporal" },
  { match: "sun body",            ourSlug: "solar-corporal" },
  { match: "solar niño",          ourSlug: "solar-ninos" },
  { match: "sun kids",            ourSlug: "solar-ninos" },
  { match: "after sun",           ourSlug: "after-sun" },
  { match: "solar eco",           ourSlug: "solar-eco" },
  { match: "mineral sun",         ourSlug: "solar-eco" },
  { match: "solar",               ourSlug: "solar-facial" },
  // Cuidado Facial
  { match: "limpiador",           ourSlug: "limpiadores" },
  { match: "cleanser",            ourSlug: "limpiadores" },
  { match: "cleansing",           ourSlug: "limpiadores" },
  { match: "limpieza facial",     ourSlug: "limpiadores" },
  { match: "desmaquillante",      ourSlug: "desmaquillantes" },
  { match: "makeup remover",      ourSlug: "desmaquillantes" },
  { match: "tónico",              ourSlug: "tonicos-esencias" },
  { match: "toner",               ourSlug: "tonicos-esencias" },
  { match: "essence",             ourSlug: "tonicos-esencias" },
  { match: "sérum",               ourSlug: "serums-aceites" },
  { match: "serum",               ourSlug: "serums-aceites" },
  { match: "aceite facial",       ourSlug: "serums-aceites" },
  { match: "facial oil",          ourSlug: "serums-aceites" },
  { match: "crema facial",        ourSlug: "crema-tratamiento" },
  { match: "hidratante facial",   ourSlug: "crema-tratamiento" },
  { match: "moisturiser",         ourSlug: "crema-tratamiento" },
  { match: "facial cream",        ourSlug: "crema-tratamiento" },
  { match: "mascarilla",          ourSlug: "mascarillas" },
  { match: "face mask",           ourSlug: "mascarillas" },
  { match: "exfoliante facial",   ourSlug: "exfoliantes-faciales" },
  { match: "facial scrub",        ourSlug: "exfoliantes-faciales" },
  { match: "contorno de ojos",    ourSlug: "contorno-ojos" },
  { match: "eye cream",           ourSlug: "contorno-ojos" },
  { match: "eye contour",         ourSlug: "contorno-ojos" },
  { match: "bálsamo labial",      ourSlug: "balsamo-labial" },
  { match: "lip balm",            ourSlug: "balsamo-labial" },
  { match: "lip care",            ourSlug: "balsamo-labial" },
  { match: "maquillaje",          ourSlug: "maquillaje" },
  { match: "makeup",              ourSlug: "maquillaje" },
  { match: "cosmetics",           ourSlug: "maquillaje" },
  // Cuidado Corporal
  { match: "exfoliante corporal", ourSlug: "exfoliante-corporal" },
  { match: "body scrub",          ourSlug: "exfoliante-corporal" },
  { match: "crema corporal",      ourSlug: "crema-hidratante-corp" },
  { match: "hidratante corporal", ourSlug: "crema-hidratante-corp" },
  { match: "body cream",          ourSlug: "crema-hidratante-corp" },
  { match: "body lotion",         ourSlug: "crema-hidratante-corp" },
  { match: "aceite corporal",     ourSlug: "aceite-corporal" },
  { match: "body oil",            ourSlug: "aceite-corporal" },
  { match: "crema de manos",      ourSlug: "crema-manos-unas" },
  { match: "hand cream",          ourSlug: "crema-manos-unas" },
  { match: "nail",                ourSlug: "crema-manos-unas" },
  { match: "cuidado íntimo",      ourSlug: "cuidado-intimo" },
  { match: "intimate",            ourSlug: "cuidado-intimo" },
  // Cosmética Eco/Vegana
  { match: "eco",                 ourSlug: "cosmetica-eco" },
  { match: "organic",             ourSlug: "cosmetica-eco" },
  { match: "natural",             ourSlug: "cosmetica-eco" },
  { match: "vegano",              ourSlug: "cosmetica-vegana" },
  { match: "vegan",               ourSlug: "cosmetica-vegana" },
  // Perfumería → cosmética general
  { match: "perfume",             ourSlug: "maquillaje" },
  { match: "fragrance",           ourSlug: "maquillaje" },
  { match: "colonia",             ourSlug: "maquillaje" },
];

export function mapBTSCategoryToSlug(categoryName: string): string | null {
  const lower = categoryName.toLowerCase();
  const hit = BTS_CATEGORY_MAP.find((m) => lower.includes(m.match.toLowerCase()));
  return hit?.ourSlug ?? null;
}

// ─── Markup helper ────────────────────────────────────────────────────────────

export function applyMarkup(costPrice: number): { retail: number; compareAt: number } {
  const retail     = parseFloat((costPrice * MARKUP).toFixed(2));
  const compareAt  = parseFloat((retail * 1.12).toFixed(2));
  return { retail, compareAt };
}

// ─── SupplierAdapter implementation ──────────────────────────────────────────

export const btswholesalerAdapter: SupplierAdapter = {
  async fetchProducts(): Promise<SupplierProduct[]> {
    const products = await fetchProductsPage(1);
    return products.map((p) => ({
      sku: p.sku,
      ean: p.ean,
      name: p.name,
      nameEs: p.name,
      descriptionEs: p.description ?? "",
      costPrice: p.price,
      stock: p.stock,
      brand: p.brand,
      images: p.images ?? [],
      categories: p.categories ?? [],
      weight: p.weight,
      volume: p.volume,
    }));
  },

  async getStock(sku: string): Promise<number> {
    const stocks = await fetchProductStock();
    return stocks.find((s) => s.sku === sku)?.stock ?? 0;
  },

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    try {
      const [firstName, ...rest] = order.shippingAddress.name.split(" ");
      const result = await btsFetch<{ orderId?: string; reference?: string }>(
        "createOrder",
        {
          reference: order.supplierOrderId,
          shipping: {
            firstName,
            lastName: rest.join(" ") || "-",
            address: order.shippingAddress.street,
            postcode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
            country: order.shippingAddress.country || "ES",
            phone: order.shippingAddress.phone || "",
            email: order.customerEmail,
          },
          products: order.items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
        }
      );
      return {
        success: true,
        supplierOrderId: result.orderId ?? result.reference ?? order.supplierOrderId,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
