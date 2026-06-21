#!/usr/bin/env tsx
import { dietisurAdapter } from "../lib/dietisur";
import { db } from "../lib/db";
import { slugify } from "../lib/utils";

async function main() {
  console.log("🔄 Syncing DietiSur products...");

  const products = await dietisurAdapter.fetchProducts();
  console.log(`Found ${products.length} products from DietiSur`);

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const sku = `DS-${product.sku}`;
    const slug = slugify(`${product.nameEs || product.name}-${product.sku}`);
    const existing = await db.product.findUnique({ where: { sku } });

    if (existing) {
      await db.product.update({
        where: { id: existing.id },
        data: { stock: product.stock, costPrice: product.costPrice },
      });
      updated++;
    } else {
      await db.product.create({
        data: {
          slug,
          name: product.nameEs || product.name,
          nameEs: product.nameEs || product.name,
          descriptionEs: product.descriptionEs || "",
          sku,
          ean: product.ean,
          supplier: "DIETISUR",
          supplierSku: product.sku,
          costPrice: product.costPrice,
          retailPrice: product.costPrice * 2.0,
          stock: product.stock,
          brand: product.brand,
          isEco: true,
          volume: product.volume,
        },
      });
      created++;
    }
  }

  console.log(`✅ DietiSur sync complete: ${created} created, ${updated} updated`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
