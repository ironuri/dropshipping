import { algoliasearch } from "algoliasearch";
import type { Product } from "@/types";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const adminKey = process.env.ALGOLIA_ADMIN_KEY!;
export const indexName =
  process.env.ALGOLIA_INDEX_NAME || "cosmetics_products";

export function getSearchClient() {
  return algoliasearch(appId, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!);
}

export function getAdminClient() {
  if (!adminKey) throw new Error("ALGOLIA_ADMIN_KEY is not set");
  return algoliasearch(appId, adminKey);
}

export interface AlgoliaProduct {
  objectID: string;
  slug: string;
  nameEs: string;
  nameCa?: string;
  descriptionEs: string;
  brand?: string;
  supplier: string;
  retailPrice: number;
  compareAtPrice?: number;
  spf?: number;
  isEco: boolean;
  isVegan: boolean;
  isCrueltyFree: boolean;
  categories: string[];
  tags: string[];
  imageUrl?: string;
  stock: number;
  salesCount: number;
}

export function productToAlgoliaRecord(product: Product): AlgoliaProduct {
  return {
    objectID: product.id,
    slug: product.slug,
    nameEs: product.nameEs,
    nameCa: product.nameCa ?? undefined,
    descriptionEs: product.descriptionEs,
    brand: product.brand ?? undefined,
    supplier: product.supplier,
    retailPrice: product.retailPrice,
    compareAtPrice: product.compareAtPrice ?? undefined,
    spf: product.spf ?? undefined,
    isEco: product.isEco,
    isVegan: product.isVegan,
    isCrueltyFree: product.isCrueltyFree,
    categories: product.categories.map((c) => c.nameEs),
    tags: product.tags,
    imageUrl: product.images[0]?.url,
    stock: product.stock,
    salesCount: 0,
  };
}

export async function indexProducts(products: Product[]) {
  const client = getAdminClient();
  const records = products.map(productToAlgoliaRecord);
  return client.saveObjects({ indexName, objects: records as unknown as Record<string, unknown>[] });
}

export async function deleteProductFromIndex(productId: string) {
  const client = getAdminClient();
  return client.deleteObject({ indexName, objectID: productId });
}
