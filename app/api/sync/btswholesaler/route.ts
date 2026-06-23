import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsPage,
  fetchProductStock,
  mapBTSCategoryToSlug,
  applyMarkup,
} from "@/lib/btswholesaler";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET  → Vercel Cron (Authorization: Bearer CRON_SECRET)
 * POST → Admin manual trigger (NextAuth session, role=ADMIN)
 *
 * Query params:
 *   ?dryRun=true   fetch & map but don't write to DB
 *   ?maxPages=N    cap pages (default 20 = 10 000 products)
 *   ?page=N        sync only one specific page
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(req);
}

export async function POST(req: NextRequest) {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(req);
}

async function runSync(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dryRun    = searchParams.get("dryRun") === "true";
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
    // Stock map (non-fatal)
    const stocks = await fetchProductStock();
    const stockMap = new Map(stocks.map((s) => [s.sku, s.stock]));

    // Our category slugs → DB ids
    const ourCategories = await db.category.findMany({ select: { id: true, slug: true } });
    const catSlugToId = new Map(ourCategories.map((c) => [c.slug, c.id]));

    const pages = singlePage
      ? [singlePage]
      : Array.from({ length: maxPages }, (_, i) => i + 1);

    for (const page of pages) {
      const products = await fetchProductsPage(page);
      if (products.length === 0) break;

      stats.pagesProcessed++;
      stats.productsScanned += products.length;

      for (const p of products) {
        try {
          const categoryIds = (p.categories ?? [])
            .map((name) => mapBTSCategoryToSlug(name))
            .filter((slug): slug is string => !!slug && catSlugToId.has(slug))
            .map((slug) => catSlugToId.get(slug)!);

          if (categoryIds.length === 0) {
            stats.skipped++;
            continue;
          }

          const btsSku = `BTS-${p.sku}`;
          const stock = stockMap.get(p.sku) ?? p.stock ?? 0;
          const { retail, compareAt } = applyMarkup(p.price);

          if (dryRun) { stats.created++; continue; }

          const existing = await db.product.findUnique({ where: { sku: btsSku } });

          if (existing) {
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
            const slug = slugify(`${p.name}-${btsSku.toLowerCase()}`);
            await db.product.create({
              data: {
                slug,
                name: p.name,
                nameEs: p.name,
                descriptionEs: p.description || `${p.name}${p.brand ? ` de ${p.brand}` : ""}.`,
                sku: btsSku,
                ean: p.ean || undefined,
                supplier: "BTSWHOLESALER",
                supplierSku: p.sku,
                costPrice: p.price,
                retailPrice: retail,
                compareAtPrice: compareAt,
                stock,
                active: stock > 0,
                brand: p.brand || undefined,
                weight: p.weight || undefined,
                volume: p.volume || undefined,
                tags: [p.brand?.toLowerCase().replace(/\s+/g, "-")].filter((t): t is string => Boolean(t)),
                categories: {
                  create: [...new Set(categoryIds)].map((categoryId) => ({ categoryId })),
                },
                images: p.images && p.images.length > 0
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

      if (products.length < 500) break;
    }

    return NextResponse.json({ success: true, dryRun, ...stats });
  } catch (err) {
    console.error("[BTS SYNC]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err), ...stats },
      { status: 500 }
    );
  }
}
