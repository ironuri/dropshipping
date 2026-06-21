import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseDecimal } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);

  if (!q) return NextResponse.json({ products: [] });

  try {
    const products = await db.product.findMany({
      where: {
        active: true,
        OR: [
          { nameEs: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
          { descriptionEs: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { salesCount: "desc" },
    });

    const result = products.map((p) => ({
      objectID: p.id,
      slug: p.slug,
      nameEs: p.nameEs,
      brand: p.brand,
      retailPrice: parseDecimal(p.retailPrice),
      imageUrl: p.images[0]?.url,
      stock: p.stock,
    }));

    return NextResponse.json({ products: result });
  } catch (err) {
    console.error("[SEARCH]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
