import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pedido confirmado | EcoSolar Cosmetics",
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let orderNumber: string | null = null;
  let customerEmail: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const data = JSON.parse(session.metadata?.orderData || "{}");
      orderNumber = null;
      customerEmail = data.email;

      // Get order from DB using stripe session id
      const { db } = await import("@/lib/db");
      const order = await db.order.findFirst({
        where: { stripeSessionId: session_id },
        select: { orderNumber: true, email: true },
      });
      orderNumber = order?.orderNumber || null;
      customerEmail = order?.email || data.email;
    } catch {
      // Session expired or invalid
    }
  }

  return (
    <div className="container py-24 flex flex-col items-center gap-6 text-center max-w-lg">
      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-[#2D5016]" />
      </div>
      <h1 className="text-3xl font-bold">¡Pedido confirmado!</h1>
      {orderNumber && (
        <p className="text-lg text-muted-foreground">
          Número de pedido: <strong className="text-foreground font-mono">{orderNumber}</strong>
        </p>
      )}
      <p className="text-muted-foreground leading-relaxed">
        {customerEmail ? (
          <>Hemos enviado la confirmación a <strong>{customerEmail}</strong>. </>
        ) : null}
        Te avisaremos cuando tu pedido sea enviado con el número de seguimiento.
      </p>
      <div className="bg-[#F5F0E8] rounded-xl p-6 w-full text-left space-y-3">
        <h2 className="font-semibold">¿Qué pasa ahora?</h2>
        <div className="space-y-2 text-sm text-[#6B6B6B]">
          <div className="flex gap-2"><span className="text-[#2D5016] font-bold">1.</span> Procesamos tu pedido en 24h</div>
          <div className="flex gap-2"><span className="text-[#2D5016] font-bold">2.</span> Lo enviamos directamente desde nuestros proveedores</div>
          <div className="flex gap-2"><span className="text-[#2D5016] font-bold">3.</span> Recibirás el tracking por email cuando salga</div>
          <div className="flex gap-2"><span className="text-[#2D5016] font-bold">4.</span> Entrega estimada en 3-5 días laborables</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button asChild className="flex-1">
          <Link href="/cuenta/pedidos">Ver mis pedidos</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/productos">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
