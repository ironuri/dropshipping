import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale = "es-ES", currency = "EUR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function generateOrderNumber(): string {
  const prefix = "ES";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateVAT(price: number, vatRate = 0.21): number {
  return price * vatRate;
}

export function getPriceWithoutVAT(price: number, vatRate = 0.21): number {
  return price / (1 + vatRate);
}

export function calculateDiscount(
  price: number,
  discountPercent: number
): number {
  return price * (1 - discountPercent / 100);
}

export function parseDecimal(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return parseFloat(String(value)) || 0;
}

export function getSpfBadgeLabel(spf: number | null | undefined): string | null {
  if (!spf) return null;
  if (spf >= 50) return "SPF50+";
  if (spf >= 30) return "SPF30+";
  return `SPF${spf}`;
}

export function isValidSpanishPostalCode(code: string): boolean {
  return /^[0-5][0-9]{4}$/.test(code);
}

export function getShippingCost(subtotal: number): number {
  const freeShippingThreshold = parseFloat(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || "35"
  );
  return subtotal >= freeShippingThreshold ? 0 : 3.99;
}

export const SPANISH_PROVINCES = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
  "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria",
  "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada",
  "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Illes Balears",
  "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
  "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
  "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
  "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Ceuta", "Melilla",
];
