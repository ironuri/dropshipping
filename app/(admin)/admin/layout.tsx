import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Truck, Settings } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/suppliers", label: "Proveedores", icon: Truck },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E4DC] shrink-0">
        <div className="p-6 border-b border-[#E8E4DC]">
          <Link href="/" className="text-lg font-bold text-[#2D5016]">
            🌿 EcoSolar Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#6B6B6B] hover:text-[#2D5016] hover:bg-[#F5F0E8] transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 px-4 w-64">
          <p className="text-xs text-muted-foreground px-3">
            Sesión: {session.user.email}
          </p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
