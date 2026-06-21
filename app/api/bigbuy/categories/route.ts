import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchCategories, buildCategoryTree, mapBBCategoryToSlug } from "@/lib/bigbuy";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cats = await fetchCategories();
    const tree = buildCategoryTree(cats);

    // Annotate each category with the slug it would map to in our DB
    const annotated = cats.map((c) => ({
      ...c,
      ourSlug: mapBBCategoryToSlug(c.name),
    }));

    return NextResponse.json({ categories: annotated, tree, total: cats.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
