// stores/productsFilterStore.ts
import { create } from 'zustand';

const normalizeCategoryIds = (ids: string[]): string[] =>
  Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean))).sort();

const areSameCategoryIds = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((item, index) => item === b[index]);

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
  viewMode: 'grid' | 'list';

  // Actions
  setSearch: (value?: string) => void;
  toggleCategoryId: (id: string) => void;
  setCategoryIds: (ids: string[]) => void;
  setHasOffer: (value?: boolean) => void;
  setSort: (sortBy?: string, descending?: boolean) => void;
  setFeatured: (value?: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilters: (filters: { search?: string; categoryIds: string[]; hasOffer?: boolean }) => void;
  clearFilters: () => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  // Initial state
  search: undefined,
  categoryIds: [],
  hasOffer: undefined,
  status: 'Active',
  isFeatured: undefined,
  sortBy: undefined,
  sortDescending: undefined,
  viewMode: 'grid',

  setSearch: (value) =>
    set((state) => {
      const nextSearch = value?.trim() || undefined;
      return state.search === nextSearch ? state : { search: nextSearch };
    }),

  setCategoryIds: (ids) =>
    set((state) => {
      const nextCategoryIds = normalizeCategoryIds(ids);
      return areSameCategoryIds(state.categoryIds, nextCategoryIds)
        ? state
        : { categoryIds: nextCategoryIds };
    }),

  setHasOffer: (value) =>
    set((state) => {
      const nextHasOffer = value ? true : undefined;
      return state.hasOffer === nextHasOffer ? state : { hasOffer: nextHasOffer };
    }),

  toggleCategoryId: (id) =>
    set((state) => {
      const nextCategoryIds = normalizeCategoryIds(
        state.categoryIds.includes(id)
          ? state.categoryIds.filter((c) => c !== id)
          : [...state.categoryIds, id],
      );

      return areSameCategoryIds(state.categoryIds, nextCategoryIds)
        ? state
        : { categoryIds: nextCategoryIds };
    }),

  setFilters: (filters) =>
    set((state) => {
      const nextSearch = filters.search?.trim() || undefined;
      const nextCategoryIds = normalizeCategoryIds(filters.categoryIds);
      const nextHasOffer = filters.hasOffer ? true : undefined;

      if (
        state.search === nextSearch &&
        state.hasOffer === nextHasOffer &&
        areSameCategoryIds(state.categoryIds, nextCategoryIds)
      ) {
        return state;
      }

      return {
        search: nextSearch,
        categoryIds: nextCategoryIds,
        hasOffer: nextHasOffer,
      };
    }),

  setSort: (sortBy, descending = false) =>
    set(() => ({
      sortBy,
      sortDescending: sortBy ? descending : undefined,
    })),

  setFeatured: (value) => set(() => ({ isFeatured: value })),

  setViewMode: (mode) => set(() => ({ viewMode: mode })),

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
