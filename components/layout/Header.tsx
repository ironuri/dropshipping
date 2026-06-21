"use client";
import Link from "next/link";
import { ShoppingBag, Heart, User, Search, Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SearchBar } from "@/components/shop/SearchBar";
import { MobileNav } from "./MobileNav";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/productos/solares", label: "Solares" },
  { href: "/productos/skincare", label: "Skincare" },
  { href: "/productos/eco", label: "Eco & Bio" },
  { href: "/productos/kits", label: "Kits & Bundles" },
];

export function Header() {
  const itemCount = useCart((s) => s.itemCount);
  const wishlistCount = useWishlist((s) => s.productIds.length);
  const setCartOpen = useCart((s) => s.setIsOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DC]">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#2D5016] shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="hidden sm:block">EcoSolar</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#6B6B6B] hover:text-[#2D5016] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cuenta/favoritos">
              <Button variant="ghost" size="icon" className="relative" aria-label="Favoritos">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#D4A853] text-[10px] text-white flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cuenta">
              <Button variant="ghost" size="icon" aria-label="Mi cuenta">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#2D5016] text-[10px] text-white flex items-center justify-center font-bold">
                  {itemCount()}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <CartDrawer />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} navLinks={NAV_LINKS} />
    </>
  );
}
