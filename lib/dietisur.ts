import Papa from "papaparse";
import type { SupplierAdapter, SupplierProduct, OrderPayload, SupplierOrderResult } from "@/types";

interface DietiSurRow {
  ean: string;
  sku: string;
  nombre: string;
  descripcion: string;
  precio_coste: string;
  precio_pvp: string;
  stock: string;
  marca: string;
  imagen: string;
  categoria: string;
  peso: string;
  volumen: string;
}

async function fetchDietiSurCSV(): Promise<DietiSurRow[]> {
  const csvUrl = process.env.DIETISUR_CSV_URL;
  if (!csvUrl) {
    throw new Error("DIETISUR_CSV_URL is not configured");
  }

  const response = await fetch(csvUrl, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch DietiSur CSV: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<DietiSurRow>(csvText, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (error: Error) => reject(error),
    });
  });
}

export const dietisurAdapter: SupplierAdapter = {
  async fetchProducts(): Promise<SupplierProduct[]> {
    const rows = await fetchDietiSurCSV();

    return rows
      .filter((row) => row.sku && row.nombre)
      .map((row) => ({
        sku: row.sku.trim(),
        ean: row.ean?.trim(),
        name: row.nombre.trim(),
        nameEs: row.nombre.trim(),
        descriptionEs: row.descripcion?.trim() || "",
        costPrice: parseFloat(row.precio_coste?.replace(",", ".") || "0"),
        stock: parseInt(row.stock || "0", 10),
        brand: row.marca?.trim(),
        images: row.imagen ? [row.imagen.trim()] : [],
        categories: row.categoria ? [row.categoria.trim()] : [],
        weight: row.peso ? parseFloat(row.peso.replace(",", ".")) : undefined,
        volume: row.volumen ? parseInt(row.volumen, 10) : undefined,
      }));
  },

  async getStock(sku: string): Promise<number> {
    const products = await dietisurAdapter.fetchProducts();
    const product = products.find((p) => p.sku === sku);
    return product?.stock ?? 0;
  },

  async placeOrder(order: OrderPayload): Promise<SupplierOrderResult> {
    // DietiSur uses email-based order flow
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const itemsList = order.items
      .map((item) => `- SKU: ${item.sku}, Cantidad: ${item.quantity}`)
      .join("\n");

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "orders@yourstore.es",
        to: "pedidos@dietisur.es",
        subject: `Nuevo pedido dropshipping - Ref: ${order.supplierOrderId}`,
        text: `
PEDIDO DROPSHIPPING
Referencia: ${order.supplierOrderId}

PRODUCTOS:
${itemsList}

DIRECCIÓN DE ENVÍO:
${order.shippingAddress.name}
${order.shippingAddress.street}
${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.province}
${order.shippingAddress.country}
Tel: ${order.shippingAddress.phone || "N/A"}

EMAIL CLIENTE: ${order.customerEmail}
        `.trim(),
      });

      return { success: true, supplierOrderId: `DS-EMAIL-${order.supplierOrderId}` };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Email send failed",
      };
    }
  },
};
