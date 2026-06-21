"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { toast } from "@/hooks/useToast";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  total: () => number;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, product.stock);
          set({
            items: items.map((i) =>
              i.productId === product.id ? { ...i, quantity: newQty } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                product: {
                  id: product.id,
                  slug: product.slug,
                  nameEs: product.nameEs,
                  retailPrice: product.retailPrice,
                  images: product.images,
                  stock: product.stock,
                  supplier: product.supplier,
                  supplierSku: product.supplierSku,
                },
                quantity: Math.min(quantity, product.stock),
              },
            ],
            isOpen: true,
          });
        }

        toast({
          title: "Añadido al carrito",
          description: product.nameEs,
        });
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.retailPrice * item.quantity,
          0
        ),

      total: () => {
        const subtotal = get().subtotal();
        const shipping = subtotal >= 35 ? 0 : 3.99;
        return subtotal + shipping;
      },

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
