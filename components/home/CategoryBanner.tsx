import Link from "next/link";

const CATEGORIES = [
  {
    href: "/categorias/solares",
    emoji: "☀️",
    title: "Protección Solar",
    description: "ISDIN, Heliocare, La Roche-Posay",
    bg: "bg-amber-50 hover:bg-amber-100",
  },
  {
    href: "/categorias/eco",
    emoji: "🌿",
    title: "Eco & Natural",
    description: "Biosolis, Florame, Dr. Hauschka",
    bg: "bg-green-50 hover:bg-green-100",
  },
  {
    href: "/categorias/skincare",
    emoji: "✨",
    title: "Skincare Premium",
    description: "Vitamina C, Niacinamida, Ácido Hialurónico",
    bg: "bg-purple-50 hover:bg-purple-100",
  },
  {
    href: "/categorias/kits",
    emoji: "🎁",
    title: "Kits & Bundles",
    description: "Rutinas completas con descuento",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
];

export function CategoryBanner() {
  return (
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        ¿Qué estás buscando?
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className={`${cat.bg} rounded-xl p-6 transition-colors group border border-[#E8E4DC]`}
          >
            <div className="text-4xl mb-3">{cat.emoji}</div>
            <h3 className="font-bold text-base group-hover:text-[#2D5016] transition-colors">
              {cat.title}
            </h3>
            <p className="text-sm text-[#6B6B6B] mt-1 leading-snug">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
