import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", details: err.errors }, { status: 400 });
    }
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
