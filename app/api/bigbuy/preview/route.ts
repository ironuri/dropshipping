import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchMergedProductsPage, fetchAllStock, applyMarkup } from "@/lib/bigbuy";

export const dynamic = "force-dynamic";

/**
 * GET /api/bigbuy/preview?categoryId=XXX&page=1
 * Returns one page of BigBuy products filtered by BigBuy category ID,
 * with retail prices calculated. Used by admin sync explorer.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const [products, stocks] = await Promise.all([
      fetchMergedProductsPage(page),
      fetchAllStock(),
    ]);

    const stockMap = new Map(stocks.map((s) => [s.sku, s.quantity]));

    const filtered = categoryId
      ? products.filter((p) => p.categoryIds.includes(categoryId))
      : products;

    const enriched = filtered.map((p) => {
      const { retail, compareAt } = applyMarkup(p.price);
      return {
        ...p,
        stock: stockMap.get(p.sku) ?? 0,
        retailPrice: retail,
        compareAtPrice: compareAt,
      };
    });

    return NextResponse.json({
      products: enriched,
      page,
      pageSize: 100,
      hasMore: products.length === 100,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
