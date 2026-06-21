"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/useToast";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast({ title: "¡Suscrito!", description: "Recibirás nuestras novedades y ofertas exclusivas." });
        setEmail("");
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error", description: "No se pudo completar la suscripción.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <section className="bg-[#2D5016] text-white">
      <div className="container py-16 flex flex-col items-center text-center gap-6">
        <h2 className="text-2xl md:text-3xl font-bold">Únete a nuestra comunidad</h2>
        <p className="text-white/80 max-w-md">
          Recibe primero las novedades, consejos de skincare y ofertas exclusivas para suscriptores.
        </p>
        <form onSubmit={submit} className="flex gap-2 w-full max-w-md">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white"
            required
          />
          <Button type="submit" className="bg-[#D4A853] hover:bg-[#C4953D] text-[#1A1A1A] font-semibold shrink-0" disabled={loading}>
            {loading ? "..." : "Suscribirme"}
          </Button>
        </form>
        <p className="text-xs text-white/50">
          Sin spam. Puedes darte de baja cuando quieras. Consulta nuestra{" "}
          <a href="/privacidad" className="underline">política de privacidad</a>.
        </p>
      </div>
    </section>
  );
}
