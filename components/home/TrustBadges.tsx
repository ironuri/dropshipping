import { Shield, Truck, RotateCcw, Award, Star, Leaf } from "lucide-react";

const BADGES = [
  { icon: Truck, title: "Envío gratis +35€", desc: "24-48h en toda España" },
  { icon: RotateCcw, title: "Devoluciones gratuitas", desc: "30 días sin preguntas" },
  { icon: Shield, title: "Pago 100% seguro", desc: "SSL + datos protegidos (RGPD)" },
  { icon: Award, title: "Productos originales", desc: "Con factura y garantía oficial" },
  { icon: Star, title: "Marcas premium", desc: "Farmacia + eco certificadas" },
  { icon: Leaf, title: "Cosmética responsable", desc: "Selección eco y cruelty-free" },
];

export function TrustBadges() {
  return (
    <section className="bg-white border-y border-[#E8E4DC] py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {BADGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#2D5016]" />
              </div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-[#6B6B6B] leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
