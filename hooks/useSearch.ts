"use client";
import { useState, useCallback } from "react";
import type { AlgoliaProduct } from "@/lib/algolia";

interface SearchState {
  query: string;
  results: AlgoliaProduct[];
  isLoading: boolean;
  isOpen: boolean;
}

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    isLoading: false,
    isOpen: false,
  });

  const search = useCallback(async (query: string) => {
    setState((prev) => ({ ...prev, query, isLoading: true, isOpen: true }));

    if (!query.trim()) {
      setState((prev) => ({ ...prev, results: [], isLoading: false }));
      return;
    }

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&limit=6`
      );
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          results: data.products || [],
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, query: "", results: [] }));
  }, []);

  return { ...state, search, close };
}
