/**
 * BigBuy REST API v1 adapter
 * Docs: https://api.bigbuy.eu/doc
 *
 * Products data lives across multiple endpoints that must be merged:
 *   /catalog/products          → sku, price, brand, weight, ean
 *   /catalog/productsinformation → name, description (per isoCode)
 *   /catalog/productsimages    → image URLs
 *   /catalog/productsstockavailable → stock quantities
 *   /catalog/productscategories  → category assignments
 *   /catalog/categories        → full category tree
 */

import type { SupplierAdapter, SupplierProduct, OrderPayload, SupplierOrderResult } from "@/types";

const BASE_URL = (process.env.BIGBUY_API_URL || "https://api.bigbuy.eu").replace(/\/$/, "");
const API_KEY  = process.env.BIGBUY_API_KEY;
const MARKUP   = parseFloat(process.env.BIGBUY_MARKUP_FACTOR || "1.8");
const PAGE_SIZE = 100;

// ─── Raw BigBuy API types ────────────────────────────────────────────────────

export interface BBCategory {
  id: string;
  isoCode?: string;
  name: string;
  parentId: string | null;
}

export interface BBProductBasic {
  id: string;
  sku: string;
  ean: string;
  price: number;
  brand: string;
  weight: number;
}

export interface BBProductInfo {
  id: string;
  sku: string;
  name: string;
  description: string;
}

export interface BBProductImages {
  id: string;
  sku?: string;
  images: Array<{ url: string; position?: number }>;
}

export interface BBProductStock {
  id: string;
  sku: string;
  quantity: number;
}

export interface BBProductCategory {
  id: string;
  sku: string;
  categories: Array<{ id: string; name: string }>;
}

// Full merged product (used for DB upsert)
export interface BBProduct {
  id: string;
  sku: string;
  ean: string;
  price: number;
  brand: string;
  weight: number;
  name: string;
  description: string;
  images: string[];
  stock: number;
  categoryIds: string[];
  categoryNames: string[];
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function bbFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_KEY) throw new Error("BIGBUY_API_KEY is not set");

  const url = `${BASE_URL}/rest${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    // Vercel functions timeout at 30s; keep individual calls fast
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`BigBuy ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public API methods ───────────────────────────────────────────────────────

/** Full category tree (all languages) */
export async function fetchCategories(): Promise<BBCategory[]> {
  return bbFetch<BBCategory[]>("/catalog/categories.json?isoCode=ES");
}

/**
 * Build a nested category tree from the flat list.
 * Useful for the admin explorer UI.
 */
export function buildCategoryTree(
  cats: BBCategory[]
): (BBCategory & { children: BBCategory[] })[] {
  const map = new Map<string, BBCategory & { children: BBCategory[] }>();
  cats.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: (BBCategory & { children: BBCategory[] })[] = [];
  map.forEach((cat) => {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  });
  return roots;
}

/** Basic product data (sku, price, brand, weight) — paginated */
export async function fetchProductsBasic(page: number): Promise<BBProductBasic[]> {
  return bbFetch<BBProductBasic[]>(
    `/catalog/products.json?isoCode=ES&pageSize=${PAGE_SIZE}&page=${page}`
  );
}

/** Spanish product names & descriptions — paginated */
export async function fetchProductsInfo(page: number): Promise<BBProductInfo[]> {
  return bbFetch<BBProductInfo[]>(
    `/catalog/productsinformation.json?isoCode=ES&pageSize=${PAGE_SIZE}&page=${page}`
  );
}

/** Product images — paginated */
export async function fetchProductsImages(page: number): Promise<BBProductImages[]> {
  return bbFetch<BBProductImages[]>(
    `/catalog/productsimages.json?pageSize=${PAGE_SIZE}&page=${page}`
  );
}

/** Stock for ALL products in one call (BigBuy supports high pageSize here) */
export async function fetchAllStock(): Promise<BBProductStock[]> {
  return bbFetch<BBProductStock[]>(
    `/catalog/productsstockavailable.json?isoCode=ES&pageSize=5000`
  );
}

/** Product → category mapping — paginated */
export async function fetchProductCategories(page: number): Promise<BBProductCategory[]> {
  return bbFetch<BBProductCategory[]>(
    `/catalog/productscategories.json?isoCode=ES&pageSize=${PAGE_SIZE}&page=${page}`
  );
}

/**
 * Fetch one page of fully merged products.
 * Merges basic + info + images + categories for the given page.
 * Stock is fetched separately (fetchAllStock) and merged by the caller.
 */
export async function fetchMergedProductsPage(
  page: number
): Promise<Omit<BBProduct, "stock">[]> {
  const [basics, infos, imagesList, categories] = await Promise.all([
    fetchProductsBasic(page),
    fetchProductsInfo(page),
    fetchProductsImages(page),
    fetchProductCategories(page),
  ]);

  if (basics.length === 0) return [];

  const infoMap  = new Map(infos.map((i) => [i.id, i]));
  const imgMap   = new Map(imagesList.map((i) => [i.id, i]));
  const catMap   = new Map(categories.map((c) => [c.id, c]));

  return basics.map((b) => {
    const info = infoMap.get(b.id);
    const imgs = imgMap.get(b.id);
    const cats = catMap.get(b.id);
    return {
      id: b.id,
      sku: b.sku,
      ean: b.ean,
      price: b.price,
      brand: b.brand,
      weight: b.weight,
      name: info?.name ?? b.sku,
      description: info?.description ?? "",
      images: imgs?.images?.map((i) => i.url) ?? [],
      categoryIds: cats?.categories?.map((c) => c.id) ?? [],
      categoryNames: cats?.categories?.map((c) => c.name) ?? [],
    };
  });
}

/**
 * Quick preview: fetch one page of products in a specific BigBuy category.
 * Used by the admin explorer before triggering a full import.
 */
export async function previewProductsByCategory(
  bigbuyCategoryId: string,
  page = 1
): Promise<Omit<BBProduct, "stock">[]> {
  // BigBuy doesn't have a direct "filter by category" param in REST v1.
  // We fetch a page and filter locally — acceptable for preview purposes.
  const all = await fetchMergedProductsPage(page);
  return all.filter((p) => p.categoryIds.includes(bigbuyCategoryId));
}

// ─── Category → our slug mapping ─────────────────────────────────────────────

/**
 * Maps BigBuy category names (lowercase, partial match) to our DB slugs.
 * After calling fetchCategories(), the admin can refine these IDs in the UI.
 * Names are matched case-insensitively with includes().
 */
export const BB_CATEGORY_MAP: Array<{
  /** Partial BigBuy category name (case-insensitive match) */
  match: string;
  /** Our DB category slug */
  ourSlug: string;
}> = [
  // Línea Solar
  { match: "solar facial",      ourSlug: "solar-facial" },
  { match: "facial sun",        ourSlug: "solar-facial" },
  { match: "solar corporal",    ourSlug: "solar-corporal" },
  { match: "body sun",          ourSlug: "solar-corporal" },
  { match: "solar niño",        ourSlug: "solar-ninos" },
  { match: "kids sun",          ourSlug: "solar-ninos" },
  { match: "after sun",         ourSlug: "after-sun" },
  { match: "solar eco",         ourSlug: "solar-eco" },
  { match: "mineral sun",       ourSlug: "solar-eco" },
  { match: "sun care",          ourSlug: "solar-facial" },
  { match: "protección solar",  ourSlug: "solar-facial" },
  { match: "protector solar",   ourSlug: "solar-facial" },
  // Cuidado Facial
  { match: "limpiador",         ourSlug: "limpiadores" },
  { match: "cleanser",          ourSlug: "limpiadores" },
  { match: "cleansing",         ourSlug: "limpiadores" },
  { match: "desmaquillante",    ourSlug: "desmaquillantes" },
  { match: "makeup remover",    ourSlug: "desmaquillantes" },
  { match: "tónico",            ourSlug: "tonicos-esencias" },
  { match: "toner",             ourSlug: "tonicos-esencias" },
  { match: "essence",           ourSlug: "tonicos-esencias" },
  { match: "sérum",             ourSlug: "serums-aceites" },
  { match: "serum",             ourSlug: "serums-aceites" },
  { match: "aceite facial",     ourSlug: "serums-aceites" },
  { match: "facial oil",        ourSlug: "serums-aceites" },
  { match: "crema facial",      ourSlug: "crema-tratamiento" },
  { match: "crema de tratamiento", ourSlug: "crema-tratamiento" },
  { match: "facial cream",      ourSlug: "crema-tratamiento" },
  { match: "hidratante facial", ourSlug: "crema-tratamiento" },
  { match: "mascarilla",        ourSlug: "mascarillas" },
  { match: "mask",              ourSlug: "mascarillas" },
  { match: "exfoliante facial", ourSlug: "exfoliantes-faciales" },
  { match: "facial exfoliant",  ourSlug: "exfoliantes-faciales" },
  { match: "contorno de ojos",  ourSlug: "contorno-ojos" },
  { match: "eye contour",       ourSlug: "contorno-ojos" },
  { match: "eye cream",         ourSlug: "contorno-ojos" },
  { match: "bálsamo labial",    ourSlug: "balsamo-labial" },
  { match: "lip balm",          ourSlug: "balsamo-labial" },
  { match: "maquillaje",        ourSlug: "maquillaje" },
  { match: "makeup",            ourSlug: "maquillaje" },
  // Cuidado Corporal
  { match: "exfoliante corporal", ourSlug: "exfoliante-corporal" },
  { match: "body scrub",        ourSlug: "exfoliante-corporal" },
  { match: "crema corporal",    ourSlug: "crema-hidratante-corp" },
  { match: "hidratante corporal", ourSlug: "crema-hidratante-corp" },
  { match: "body cream",        ourSlug: "crema-hidratante-corp" },
  { match: "body lotion",       ourSlug: "crema-hidratante-corp" },
  { match: "aceite corporal",   ourSlug: "aceite-corporal" },
  { match: "body oil",          ourSlug: "aceite-corporal" },
  { match: "crema de manos",    ourSlug: "crema-manos-unas" },
  { match: "hand cream",        ourSlug: "crema-manos-unas" },
  { match: "cuidado íntimo",    ourSlug: "cuidado-intimo" },
  { match: "intimate",          ourSlug: "cuidado-intimo" },
  // Cosmética Eco
  { match: "eco",               ourSlug: "cosmetica-eco" },
  { match: "natural cosmetic",  ourSlug: "cosmetica-eco" },
  { match: "organic",           ourSlug: "cosmetica-eco" },
  { match: "vegano",            ourSlug: "cosmetica-vegana" },
  { match: "vegan",             ourSlug: "cosmetica-vegana" },
];

/** Map a BigBuy category name to our DB slug. Returns null if no match. */
export function mapBBCategoryToSlug(bbCategoryName: string): string | null {
  const lower = bbCategoryName.toLowerCase();
  const match = BB_CATEGORY_MAP.find((m) => lower.includes(m.match.toLowerCase()));
  return match?.ourSlug ?? null;
}

// ─── Markup helper ────────────────────────────────────────────────────────────

export function applyMarkup(costPrice: number): { retail: number; compareAt: number } {
  const retail = parseFloat((costPrice * MARKUP).toFixed(2));
  const compareAt = parseFloat((retail * 1.12).toFixed(2));
  return { retail, compareAt };
}

// ─── SupplierAdapter implementation ──────────────────────────────────────────

export const bigbuyAdapter: SupplierAdapter = {
  async fetchProducts(): Promise<SupplierProduct[]> {
    // Fetch page 1 only — used for lightweight checks.
    // Full sync uses fetchMergedProductsPage + fetchAllStock directly.
    const basics = await fetchProductsBasic(1);
    const infos  = await fetchProductsInfo(1);
    const infoMap = new Map(infos.map((i) => [i.id, i]));

    return basics.map((b) => ({
      sku: b.sku,
      ean: b.ean,
      name: infoMap.get(b.id)?.name ?? b.sku,
      nameEs: infoMap.get(b.id)?.name ?? b.sku,
      descriptionEs: infoMap.get(b.id)?.description ?? "",
      costPrice: b.price,
      stock: 0,
      brand: b.brand,
      images: [],
      categories: [],
      weight: b.weight,
    }));
  },

  async getStock(sku: string): Promise<number> {
    const data = await bbFetch<BBProductStock[]>(
      `/catalog/product/${sku}/stocks.json`
    );
    return Array.isArray(data) ? (data[0]?.quantity ?? 0) : 0;
  },

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    try {
      const [firstName, ...rest] = order.shippingAddress.name.split(" ");
      const payload = {
        order: {
          internalReference: order.supplierOrderId,
          language: "es",
          paymentMethod: "moneyorder",
          carriers: [{ name: "correos" }],
          shippingAddress: {
            firstName,
            lastName: rest.join(" ") || "-",
            country: order.shippingAddress.country || "ES",
            postcode: order.shippingAddress.postalCode,
            town: order.shippingAddress.city,
            address: order.shippingAddress.street,
            phone: order.shippingAddress.phone || "",
            email: order.customerEmail,
          },
          products: order.items.map((item) => ({
            reference: item.sku,
            quantity: item.quantity,
          })),
        },
      };

      const result = await bbFetch<{ orderReference: string }>("/order/create.json", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return { success: true, supplierOrderId: result.orderReference };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
