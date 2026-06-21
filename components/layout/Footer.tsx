import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Shield, Truck, RotateCcw, Package } from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, label: "Envío gratis +35€" },
  { icon: RotateCcw, label: "Devoluciones 30 días" },
  { icon: Shield, label: "Pago seguro SSL" },
  { icon: Package, label: "Productos originales" },
];

const FOOTER_LINKS = {
  tienda: [
    { href: "/productos", label: "Todos los productos" },
    { href: "/categorias/solares", label: "Protección solar" },
    { href: "/categorias/skincare", label: "Skincare" },
    { href: "/categorias/eco", label: "Eco & Natural" },
    { href: "/categorias/kits", label: "Kits y bundles" },
  ],
  ayuda: [
    { href: "/envios", label: "Envíos y entregas" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/faq", label: "Preguntas frecuentes" },
    { href: "/contacto", label: "Contacto" },
    { href: "/rastrear-pedido", label: "Rastrear pedido" },
  ],
  legal: [
    { href: "/privacidad", label: "Política de privacidad" },
    { href: "/terminos", label: "Términos y condiciones" },
    { href: "/cookies", label: "Política de cookies" },
    { href: "/aviso-legal", label: "Aviso legal" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#F5F0E8] mt-16">
      {/* Trust badges */}
      <div className="border-b border-[#E8E4DC]">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm font-medium text-[#2D5016]">
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="text-xl font-bold text-[#2D5016] mb-4">🌿 Feliu Cosmetics</p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Expertos en cosmética solar de farmacia y productos naturales para el cuidado de la piel.
          </p>
          <p className="text-xs text-[#6B6B6B] mt-4">
            Cumplimos con el Reglamento (CE) 1223/2009 sobre productos cosméticos.
          </p>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider text-[#6B6B6B] mb-4">Tienda</p>
          <ul className="space-y-2">
            {FOOTER_LINKS.tienda.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#2D5016] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider text-[#6B6B6B] mb-4">Ayuda</p>
          <ul className="space-y-2">
            {FOOTER_LINKS.ayuda.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#2D5016] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider text-[#6B6B6B] mb-4">Legal</p>
          <ul className="space-y-2">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[#6B6B6B] hover:text-[#2D5016] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator className="bg-[#E8E4DC]" />
      <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B6B]">
        <p>© {new Date().getFullYear()} Feliu Cosmetics S.L. · CIF: B-XXXXXXXX · Todos los derechos reservados</p>
        <div className="flex items-center gap-4">
          <span>💳 Visa · Mastercard · Bizum</span>
          <span>🔒 SSL Seguro</span>
        </div>
      </div>
    </footer>
  );
}
