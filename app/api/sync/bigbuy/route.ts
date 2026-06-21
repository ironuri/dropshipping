import { NextRequest, NextResponse } from "next/server";
import {
  fetchMergedProductsPage,
  fetchAllStock,
  mapBBCategoryToSlug,
  applyMarkup,
} from "@/lib/bigbuy";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds (Vercel Pro / max hobby 10s cron)

/**
 * GET  → Vercel Cron (bearer auth with CRON_SECRET)
 * POST → Admin manual trigger (session auth)
 *
 * Query params:
 *   ?page=N        sync only page N (default: all pages)
 *   ?dryRun=true   fetch & map but don't write to DB
 *   ?maxPages=N    cap pages (default: 20 = 2000 products max per run)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(req);
}

export async function POST(req: NextRequest) {
  // Imported here to avoid edge runtime
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(req);
}

async function runSync(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dryRun   = searchParams.get("dryRun") === "true";
  const maxPages  = parseInt(searchParams.get("maxPages") || "20", 10);
  const singlePage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : null;

  const stats = {
    pagesProcessed: 0,
    productsScanned: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Fetch all stock upfront (single call, efficient)
    const stocks = await fetchAllStock();
    const stockMap = new Map(stocks.map((s) => [s.sku, s.quantity]));

    // Pre-load our category slugs → DB ids
    const ourCategories = await db.category.findMany({ select: { id: true, slug: true } });
    const catSlugToId = new Map(ourCategories.map((c) => [c.slug, c.id]));

    const pages = singlePage ? [singlePage] : Array.from({ length: maxPages }, (_, i) => i + 1);

    for (const page of pages) {
      const products = await fetchMergedProductsPage(page);
      if (products.length === 0) break;

      stats.pagesProcessed++;
      stats.productsScanned += products.length;

      for (const p of products) {
        try {
          // Map BigBuy categories → our slug → our DB category IDs
          const ourCategoryIds = p.categoryNames
            .map((name) => mapBBCategoryToSlug(name))
            .filter((slug): slug is string => !!slug && catSlugToId.has(slug))
            .map((slug) => catSlugToId.get(slug)!);

          // Skip products that don't match any of our categories
          if (ourCategoryIds.length === 0) {
            stats.skipped++;
            continue;
          }

          const bbSku = `BB-${p.sku}`;
          const { retail, compareAt } = applyMarkup(p.price);
          const stock = stockMap.get(p.sku) ?? 0;

          if (dryRun) {
            stats.created++; // count as "would create"
            continue;
          }

          const existing = await db.product.findUnique({ where: { sku: bbSku } });

          if (existing) {
            // Update mutable fields only
            await db.product.update({
              where: { id: existing.id },
              data: {
                stock,
                costPrice: p.price,
                retailPrice: retail,
                compareAtPrice: compareAt,
                active: stock > 0,
              },
            });
            stats.updated++;
          } else {
            const slug = slugify(`${p.name}-${bbSku.toLowerCase()}`);
            await db.product.create({
              data: {
                slug,
                name: p.name,
                nameEs: p.name,
                descriptionEs: p.description || `${p.name} de ${p.brand}.`,
                sku: bbSku,
                ean: p.ean || undefined,
                supplier: "BIGBUY",
                supplierSku: p.sku,
                costPrice: p.price,
                retailPrice: retail,
                compareAtPrice: compareAt,
                stock,
                active: stock > 0,
                brand: p.brand,
                weight: p.weight || undefined,
                tags: [p.brand?.toLowerCase().replace(/\s+/g, "-")].filter(Boolean),
                categories: {
                  create: [...new Set(ourCategoryIds)].map((categoryId) => ({ categoryId })),
                },
                images: p.images.length > 0
                  ? {
                      create: p.images.slice(0, 5).map((url, i) => ({
                        url,
                        altEs: p.name,
                        position: i,
                      })),
                    }
                  : undefined,
              },
            });
            stats.created++;
          }
        } catch (err) {
          stats.errors.push(`${p.sku}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Break early if last page was not full
      if (products.length < 100) break;
    }

    return NextResponse.json({ success: true, dryRun, ...stats });
  } catch (err) {
    console.error("[BIGBUY SYNC]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err), ...stats },
      { status: 500 }
    );
  }
}
