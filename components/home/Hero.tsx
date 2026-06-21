import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2D5016] to-[#4A7C2F] text-white">
      <div className="container py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <p className="text-[#D4A853] font-medium tracking-wider uppercase text-sm mb-4">
            🌿 Cosmética solar premium &amp; natural
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance mb-6">
            Cuida tu piel con lo mejor de la farmacia y la naturaleza
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl">
            Solares de farmacia (ISDIN, Heliocare, La Roche-Posay) y cosméticos naturales eco-certificados. Envío gratis en pedidos +35€.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" className="bg-[#D4A853] hover:bg-[#C4953D] text-[#1A1A1A] font-semibold" asChild>
              <Link href="/categorias/solares">Ver solares</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/categorias/skincare">Ver skincare</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-white/70">
            <span>✓ +50 marcas premium</span>
            <span>✓ Envío 24-48h</span>
            <span>✓ Devoluciones gratis</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-9xl md:text-[10rem] opacity-20 select-none">☀️</div>
        </div>
      </div>
      {/* Wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 60" className="w-full fill-[#FAFAF8]">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
