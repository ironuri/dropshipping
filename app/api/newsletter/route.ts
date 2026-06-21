import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), name: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = schema.parse(body);

    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email, name, source: "website" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
