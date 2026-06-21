"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistStore {
  productIds: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addItem: (productId) =>
        set({ productIds: [...get().productIds, productId] }),

      removeItem: (productId) =>
        set({ productIds: get().productIds.filter((id) => id !== productId) }),

      toggle: (product) => {
        const { productIds, addItem, removeItem } = get();
        if (productIds.includes(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product.id);
        }
      },

      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    {
      name: "wishlist-storage",
    }
  )
);
