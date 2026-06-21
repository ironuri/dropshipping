"use client";
import { useState, useEffect } from "react";

const messages = [
  "Envío gratis en pedidos superiores a 35€",
  "Devoluciones gratuitas en 30 días",
  "Más de 50 marcas premium disponibles",
  "Productos 100% originales con factura",
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#2D5016] text-white py-2 text-center text-sm font-medium tracking-wide">
      <span key={current} className="animate-fade-in">
        {messages[current]}
      </span>
    </div>
  );
}
