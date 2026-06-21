import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_CURRENCY = "eur";
export const VAT_RATE = 0.21; // Spain IVA

export function toStripeAmount(euros: number): number {
  return Math.round(euros * 100);
}

export function fromStripeAmount(cents: number): number {
  return cents / 100;
}
