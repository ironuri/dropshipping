import { NextRequest, NextResponse } from "next/server";
import { bigbuyAdapter } from "@/lib/bigbuy";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

// Vercel Cron Job - called every 6 hours
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await bigbuyAdapter.fetchProducts();
    let updated = 0;
    let created = 0;

    for (const product of products) {
      const slug = slugify(`${product.nameEs || product.name}-${product.sku}`);

      const existing = await db.product.findUnique({ where: { sku: `BB-${product.sku}` } });

      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: {
            stock: product.stock,
            costPrice: product.costPrice,
          },
        });
        updated++;
      } else {
        await db.product.create({
          data: {
            slug,
            name: product.nameEs || product.name,
            nameEs: product.nameEs || product.name,
            descriptionEs: product.descriptionEs || "",
            sku: `BB-${product.sku}`,
            ean: product.ean,
            supplier: "BIGBUY",
            supplierSku: product.sku,
            costPrice: product.costPrice,
            retailPrice: product.costPrice * 1.8,
            stock: product.stock,
            brand: product.brand,
            weight: product.weight,
            images: product.images ? {
              create: product.images.slice(0, 5).map((url, i) => ({
                url,
                altEs: product.nameEs || product.name,
                position: i,
              })),
            } : undefined,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, updated, created, total: products.length });
  } catch (err) {
    console.error("[BIGBUY SYNC]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
