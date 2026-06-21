"use client";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface Props {
  open: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}

export function MobileNav({ open, onClose, navLinks }: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-[#2D5016] text-xl">🌿 Feliu Cosmetics</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-2 py-3 text-base font-medium hover:text-[#2D5016] hover:bg-[#F5F0E8] rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Separator className="my-4" />
          <Link href="/cuenta" onClick={onClose} className="block px-2 py-3 text-sm text-muted-foreground hover:text-foreground">
            Mi cuenta
          </Link>
          <Link href="/cuenta/pedidos" onClick={onClose} className="block px-2 py-3 text-sm text-muted-foreground hover:text-foreground">
            Mis pedidos
          </Link>
          <Link href="/cuenta/favoritos" onClick={onClose} className="block px-2 py-3 text-sm text-muted-foreground hover:text-foreground">
            Favoritos
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
