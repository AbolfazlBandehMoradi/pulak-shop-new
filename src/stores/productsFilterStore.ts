// stores/productsFilterStore.ts
import { create } from "zustand";

interface ShopStore {
  // Filters
  search?: string;
  categoryIds: string[];
  hasOffer?: boolean;
  status?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortDescending?: boolean;

  // UI
  viewMode: "grid" | "list";

  // Actions
  setSearch: (value?: string) => void;
  toggleCategoryId: (id: string) => void;
  setCategoryIds: (ids: string[]) => void;
  setHasOffer: (value?: boolean) => void;
  setSort: (sortBy?: string, descending?: boolean) => void;
  setFeatured: (value?: boolean) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setFilters: (filters: {
    search?: string;
    categoryIds: string[];
    hasOffer?: boolean;
  }) => void;
  clearFilters: () => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  // Initial state
  search: undefined,
  categoryIds: [],
  hasOffer: undefined,
  status: "Active",
  isFeatured: undefined,
  sortBy: undefined,
  sortDescending: undefined,
  viewMode: "grid",

  setSearch: (value) =>
    set(() => ({ search: value?.trim() || undefined })),

  setCategoryIds: (ids) =>
    set(() => ({ categoryIds: ids })),

  setHasOffer: (value) =>
    set(() => ({ hasOffer: value })),

  toggleCategoryId: (id) =>
    set((state) => ({
      categoryIds: state.categoryIds.includes(id)
        ? state.categoryIds.filter((c) => c !== id)
        : [...state.categoryIds, id],
    })),

  setFilters: (filters) =>
    set(() => ({
      search: filters.search?.trim() || undefined,
      categoryIds: filters.categoryIds,
      hasOffer: filters.hasOffer,
    })),

  setSort: (sortBy, descending = false) =>
    set(() => ({
      sortBy,
      sortDescending: sortBy ? descending : undefined,
    })),

  setFeatured: (value) =>
    set(() => ({ isFeatured: value })),

  setViewMode: (mode) =>
    set(() => ({ viewMode: mode })),

  clearFilters: () =>
    set(() => ({
      search: undefined,
      categoryIds: [],
      hasOffer: undefined,
      isFeatured: undefined,
      sortBy: undefined,
      sortDescending: undefined,
    })),
}));
