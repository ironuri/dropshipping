#!/usr/bin/env tsx
import { bigbuyAdapter } from "../lib/bigbuy";
import { db } from "../lib/db";
import { slugify } from "../lib/utils";

async function main() {
  console.log("🔄 Syncing BigBuy products...");

  const products = await bigbuyAdapter.fetchProducts();
  console.log(`Found ${products.length} products from BigBuy`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const sku = `BB-${product.sku}`;
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
            supplier: "BIGBUY",
            supplierSku: product.sku,
            costPrice: product.costPrice,
            retailPrice: product.costPrice * 1.8,
            stock: product.stock,
            brand: product.brand,
            weight: product.weight,
          },
        });
        created++;
      }
    } catch (err) {
      console.error(`Error processing ${product.sku}:`, err);
      errors++;
    }
  }

  console.log(`✅ BigBuy sync complete: ${created} created, ${updated} updated, ${errors} errors`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
