import type { SupplierAdapter, SupplierProduct, OrderPayload, SupplierOrderResult } from "@/types";

const BIGBUY_API_URL = process.env.BIGBUY_API_URL || "https://api.bigbuy.eu";
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

interface BigBuyProduct {
  id: string;
  sku: string;
  ean: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  images: Array<{ url: string }>;
  categories: Array<{ id: string; name: string }>;
  weight: number;
}

interface BigBuyStockResponse {
  stocks: Array<{ sku: string; quantity: number }>;
}

async function bigbuyFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!BIGBUY_API_KEY) {
    throw new Error("BIGBUY_API_KEY is not configured");
  }

  const url = `${BIGBUY_API_URL}/rest${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${BIGBUY_API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`BigBuy API error ${response.status}: ${error}`);
  }

  return response.json() as Promise<T>;
}

export const bigbuyAdapter: SupplierAdapter = {
  async fetchProducts(): Promise<SupplierProduct[]> {
    const products = await bigbuyFetch<BigBuyProduct[]>(
      "/catalog/products.json?isoCode=ES&pageSize=100"
    );

    return products.map((p) => ({
      sku: p.sku,
      ean: p.ean,
      name: p.name,
      nameEs: p.name,
      descriptionEs: p.description,
      costPrice: p.price,
      stock: p.stock,
      brand: p.brand,
      images: p.images.map((i) => i.url),
      categories: p.categories.map((c) => c.name),
      weight: p.weight,
    }));
  },

  async getStock(sku: string): Promise<number> {
    const data = await bigbuyFetch<BigBuyStockResponse>(
      `/catalog/product/${sku}/stocks.json`
    );
    const stockItem = data.stocks.find((s) => s.sku === sku);
    return stockItem?.quantity ?? 0;
  },

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    try {
      const payload = {
        order: {
          internalReference: order.supplierOrderId,
          language: "es",
          paymentMethod: "moneyorder",
          carriers: [{ name: "correos" }],
          shippingAddress: {
            firstName: order.shippingAddress.name.split(" ")[0],
            lastName: order.shippingAddress.name.split(" ").slice(1).join(" "),
            country: order.shippingAddress.country,
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

      const result = await bigbuyFetch<{ orderReference: string }>(
        "/order/create.json",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      return {
        success: true,
        supplierOrderId: result.orderReference,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
