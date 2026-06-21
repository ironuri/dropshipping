"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const accept = (all: boolean) => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ analytics: all, marketing: all, timestamp: Date.now() })
    );
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#E8E4DC] shadow-lg">
      <div className="container py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-[#6B6B6B] flex-1">
          Usamos cookies para mejorar tu experiencia y analizar el tráfico. Consulta nuestra{" "}
          <Link href="/cookies" className="underline hover:text-[#2D5016]">
            política de cookies
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-[#2D5016]">
            política de privacidad
          </Link>{" "}
          (RGPD / LOPD).
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => accept(false)}>
            Solo esenciales
          </Button>
          <Button size="sm" onClick={() => accept(true)}>
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
}
