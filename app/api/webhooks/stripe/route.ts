import { NextRequest, NextResponse } from "next/server";
import { stripe, fromStripeAmount } from "@/lib/stripe";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { getSupplierAdapter } from "@/lib/suppliers";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const rawData = session.metadata?.orderData;
    if (!rawData) return;

    const orderData = JSON.parse(rawData);
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        email: orderData.email,
        status: "CONFIRMED",
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        shippingName: orderData.name,
        shippingStreet: orderData.street + (orderData.apartment ? `, ${orderData.apartment}` : ""),
        shippingCity: orderData.city,
        shippingProvince: orderData.province,
        shippingPostalCode: orderData.postalCode,
        shippingCountry: "ES",
        shippingPhone: orderData.phone,
        shippingMethod: orderData.shippingMethod,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        taxAmount: orderData.subtotal * 0.21,
        discountAmount: 0,
        total: orderData.total,
      },
    });

    // Create order items and update stock
    const products = await db.product.findMany({
      where: { id: { in: orderData.items.map((i: { productId: string }) => i.productId) } },
    });

    // Group items by supplier
    const supplierGroups: Record<string, Array<{ productId: string; sku: string; quantity: number }>> = {};

    for (const item of orderData.items as Array<{ productId: string; quantity: number }>) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const price = parseFloat(product.retailPrice.toString());

      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          total: price * item.quantity,
        },
      });

      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
      });

      const supplier = product.supplier;
      if (!supplierGroups[supplier]) supplierGroups[supplier] = [];
      supplierGroups[supplier].push({ productId: product.id, sku: product.supplierSku, quantity: item.quantity });
    }

    // Create supplier sub-orders and place them
    for (const [supplier, items] of Object.entries(supplierGroups)) {
      const supplierOrder = await db.supplierOrder.create({
        data: {
          orderId: order.id,
          supplier: supplier as "BIGBUY" | "DIETISUR",
          status: "PENDING",
        },
      });

      // Link items to supplier order
      await db.orderItem.updateMany({
        where: {
          orderId: order.id,
          product: { supplier: supplier as "BIGBUY" | "DIETISUR" },
        },
        data: { supplierOrderId: supplierOrder.id },
      });

      // Place order with supplier
      try {
        const adapter = getSupplierAdapter(supplier);
        const result = await adapter.placeOrder({
          supplierOrderId: supplierOrder.id,
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
          shippingAddress: {
            id: "",
            name: orderData.name,
            street: orderData.street,
            city: orderData.city,
            province: orderData.province,
            postalCode: orderData.postalCode,
            country: "ES",
            phone: orderData.phone,
            isDefault: false,
          },
          customerEmail: orderData.email,
        });

        await db.supplierOrder.update({
          where: { id: supplierOrder.id },
          data: {
            status: result.success ? "SENT" : "FAILED",
            supplierOrderId: result.supplierOrderId,
            notes: result.error,
          },
        });
      } catch (err) {
        console.error(`[SUPPLIER ORDER] Failed for ${supplier}:`, err);
        await db.supplierOrder.update({
          where: { id: supplierOrder.id },
          data: { status: "FAILED", notes: String(err) },
        });
      }
    }

    // Send confirmation email
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME || "EcoSolar"} <${process.env.RESEND_FROM_EMAIL}>`,
        to: orderData.email,
        subject: `Confirmación de pedido ${orderNumber} — EcoSolar Cosmetics`,
        html: `
          <h1>¡Gracias por tu pedido!</h1>
          <p>Hola ${orderData.name},</p>
          <p>Tu pedido <strong>${orderNumber}</strong> ha sido confirmado.</p>
          <p>Te avisaremos cuando sea enviado.</p>
          <p>Total: <strong>€${orderData.total.toFixed(2)}</strong></p>
          <hr>
          <p>EcoSolar Cosmetics</p>
        `,
      });
    } catch (emailErr) {
      console.error("[ORDER EMAIL]", emailErr);
    }
  } catch (err) {
    console.error("[WEBHOOK HANDLER]", err);
  }
}
