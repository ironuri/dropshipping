import { NextRequest, NextResponse } from "next/server";
import { stripe, toStripeAmount, STRIPE_CURRENCY } from "@/lib/stripe";
import { db } from "@/lib/db";
import { generateOrderNumber, parseDecimal } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
  email: z.string().email(),
  name: z.string().min(2),
  street: z.string().min(5),
  apartment: z.string().optional(),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().regex(/^\d{5}$/),
  phone: z.string().optional(),
  shippingMethod: z.enum(["standard", "express"]),
  shippingCost: z.number(),
  total: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verify products and stock
    const products = await db.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, active: true },
    });

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: "Algunos productos no están disponibles." }, { status: 400 });
    }

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente: ${product?.nameEs}` }, { status: 400 });
      }
    }

    // Calculate real total server-side
    const subtotal = data.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + parseDecimal(product.retailPrice) * item.quantity;
    }, 0);
    const shipping = data.shippingMethod === "express" ? 6.99 : subtotal >= 35 ? 0 : 3.99;
    const realTotal = subtotal + shipping;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: data.email,
      locale: "es",
      line_items: data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: product.nameEs,
              metadata: { productId: product.id, sku: product.sku },
            },
            unit_amount: toStripeAmount(parseDecimal(product.retailPrice)),
          },
          quantity: item.quantity,
        };
      }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: toStripeAmount(shipping), currency: STRIPE_CURRENCY },
            display_name: data.shippingMethod === "express" ? "Envío express 24-48h" : "Envío estándar 3-5 días",
          },
        },
      ],
      metadata: {
        orderData: JSON.stringify({
          items: data.items,
          email: data.email,
          name: data.name,
          street: data.street,
          apartment: data.apartment || "",
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          phone: data.phone || "",
          shippingMethod: data.shippingMethod,
          shippingCost: shipping,
          subtotal,
          total: realTotal,
        }),
      },
      success_url: `${siteUrl}/pedido/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      tax_id_collection: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de checkout inválidos." }, { status: 400 });
    }
    console.error("[CHECKOUT]", err);
    return NextResponse.json({ error: "Error al crear sesión de pago" }, { status: 500 });
  }
}
