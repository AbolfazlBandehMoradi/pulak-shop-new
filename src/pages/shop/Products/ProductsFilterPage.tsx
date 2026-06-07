import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShopStore } from '@/stores/productsFilterStore';
import useCategories from '@/hooks/useCategories';
import { useLangStore } from '@/stores/languageStore';
import { areSameStrings, parseCategoryIdsParam, parseHasOfferParam } from '@/utils/urlHelpers';
import { FilterPanelSkeleton, ProductsContentSkeleton } from './sections/FilterPageSkeletons';
import FiltersSidebar from './sections/FiltersSidebar';
import Spinner from '@/components/ui/Spinner';
import ApiError from '@/pages/error/ApiError';
import { type CatalogProduct } from '@/types/productView.types';
import ProductCard from './sections/ProductCard';

const GRID_SKELETON_COUNT = 9;
const MAX_GRID_SKELETON_COUNT = 12;
const MANAGED_QUERY_KEYS = [
  'q',
  'search',
  'categoryIds',
  'minPrice',
  'maxPrice',
  'hasOffer',
] as const;

type ShopFiltersSnapshot = {
  search?: string;
  categoryIds: string[];
  hasOffer?: boolean;
};

const normalizeSearchValue = (value?: string) => value?.trim() || undefined;

const normalizeCategoryIds = (ids: string[]) =>
  Array.from(new Set(ids.map((item) => item.trim()).filter(Boolean))).sort();

const normalizeHasOffer = (value?: boolean) => (value ? true : undefined);

const normalizeFilters = (filters: ShopFiltersSnapshot): ShopFiltersSnapshot => ({
  search: normalizeSearchValue(filters.search),
  categoryIds: normalizeCategoryIds(filters.categoryIds),
  hasOffer: normalizeHasOffer(filters.hasOffer),
});

const areSameFilters = (a: ShopFiltersSnapshot, b: ShopFiltersSnapshot) => {
  const normalizedA = normalizeFilters(a);
  const normalizedB = normalizeFilters(b);

  return (
    normalizedA.search === normalizedB.search &&
    normalizedA.hasOffer === normalizedB.hasOffer &&
    areSameStrings(normalizedA.categoryIds, normalizedB.categoryIds)
  );
};

const parseFiltersFromSearch = (searchValue: string): ShopFiltersSnapshot => {
  const params = new URLSearchParams(searchValue);
  const parsedHasOffer = parseHasOfferParam(params.get('hasOffer'));

  return normalizeFilters({
    search: params.get('search') ?? params.get('q') ?? undefined,
    categoryIds: parseCategoryIdsParam(params.get('categoryIds')),
    hasOffer: parsedHasOffer === false ? undefined : parsedHasOffer,
  });
};

const buildSearchParams = (
  currentSearch: string,
  filters: ShopFiltersSnapshot,
): URLSearchParams => {
  const normalizedFilters = normalizeFilters(filters);
  const params = new URLSearchParams(currentSearch);

  MANAGED_QUERY_KEYS.forEach((key) => params.delete(key));

  if (normalizedFilters.search) {
    params.set('search', normalizedFilters.search);
  }

  if (normalizedFilters.categoryIds.length > 0) {
    params.set('categoryIds', normalizedFilters.categoryIds.join(','));
  }

  if (normalizedFilters.hasOffer) {
    params.set('hasOffer', 'true');
  }

  return params;
};

const toStableQueryString = (params: URLSearchParams): string => {
  const snapshot = new URLSearchParams(params);
  snapshot.sort();

  return snapshot.toString();
};

export default function ProductsFilterPage() {
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);

  const search = useShopStore((s) => s.search);
  const categoryIds = useShopStore((s) => s.categoryIds);
  const hasOffer = useShopStore((s) => s.hasOffer);
  const setSearch = useShopStore((s) => s.setSearch);
  const setCategoryIds = useShopStore((s) => s.setCategoryIds);
  const setHasOffer = useShopStore((s) => s.setHasOffer);
  const setFilters = useShopStore((s) => s.setFilters);
  const clearFilters = useShopStore((s) => s.clearFilters);

  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const syncedQueryRef = useRef<string>('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError: isProductsError,
  } = useInfiniteProducts();

  const products = data?.pages.flatMap((page) => page.products) ?? [];

  const normalizedActiveFilters = useMemo<ShopFiltersSnapshot>(
    () =>
      normalizeFilters({
        search,
        categoryIds,
        hasOffer,
      }),
    [search, categoryIds, hasOffer],
  );

  const hasProducts = products.length > 0;
  const showProductsSkeleton = !hasProducts && (isLoading || isFetching) && !isFetchingNextPage;
  const skeletonCount = Math.min(
    Math.max(products.length, GRID_SKELETON_COUNT),
    MAX_GRID_SKELETON_COUNT,
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasCompletedInitialLoadRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      hasCompletedInitialLoadRef.current = true;
    }
  }, [isLoading]);

  const showInitialPageSkeleton = !hasCompletedInitialLoadRef.current && isLoading;

  useEffect(() => {
    try {
      const nextFilters = parseFiltersFromSearch(location.search);

      const currentFilters = normalizeFilters({
        search,
        categoryIds,
        hasOffer,
      });

      if (!areSameFilters(nextFilters, currentFilters)) {
        setFilters(nextFilters);
      }

      syncedQueryRef.current = toStableQueryString(new URLSearchParams(location.search));

      setIsUrlHydrated(true);
    } catch (err: unknown) {
      console.error('Error hydrating URL params:', err);

      setComponentError(
        err instanceof Error ? err.message : t('productsFilter.failedToParseUrlParams'),
      );
    }
  }, [location.search]);

  useEffect(() => {
    try {
      if (!isUrlHydrated) return;

      // IMPORTANT:
      // DON'T build from location.search
      const nextParams = buildSearchParams('', normalizedActiveFilters);

      const nextStableQuery = toStableQueryString(nextParams);

      // Prevent loops
      if (nextStableQuery === syncedQueryRef.current) {
        return;
      }

      syncedQueryRef.current = nextStableQuery;

      setSearchParams(nextParams, {
        replace: true,
      });
    } catch (err: unknown) {
      console.error('Error updating URL:', err);

      setComponentError(err instanceof Error ? err.message : t('productsFilter.failedToUpdateUrl'));
    }
  }, [normalizedActiveFilters, isUrlHydrated]);

  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClearFilters = () => {
    clearFilters();
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    categories: true,
  });

  const toggleSection = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasActiveFilters =
    normalizedActiveFilters.categoryIds.length > 0 ||
    Boolean(normalizedActiveFilters.search) ||
    Boolean(normalizedActiveFilters.hasOffer);

  const activeFilterTags = useMemo(() => {
    const tags: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (normalizedActiveFilters.search) {
      tags.push({
        key: 'search',
        label: `${t('productsFilter.activeSearchLabel')}: ${normalizedActiveFilters.search}`,
        onRemove: () => setSearch(undefined),
      });
    }

    if (normalizedActiveFilters.hasOffer) {
      tags.push({
        key: 'has-offer',
        label: t('productsFilter.onlyDiscountedProducts'),
        onRemove: () => setHasOffer(undefined),
      });
    }

    if (normalizedActiveFilters.categoryIds.length > 0) {
      tags.push({
        key: 'categories',
        label: `${t('productsFilter.filters')}: ${t('productsFilter.categories')}`,
        onRemove: () => setCategoryIds([]),
      });
    }

    return tags;
  }, [
    normalizedActiveFilters.search,
    normalizedActiveFilters.hasOffer,
    normalizedActiveFilters.categoryIds,
    t,
    setSearch,
    setHasOffer,
    setCategoryIds,
  ]);

  const getImageUrl = (product: CatalogProduct): string | null => {
    if (!product.mainImage?.filePath) {
      return null;
    }

    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5299';
    return product.mainImage.filePath.startsWith('http')
      ? product.mainImage.filePath
      : `${base}${product.mainImage.filePath}`;
  };

  if (componentError || isCategoriesError || isProductsError) {
    return <ApiError onRetry={() => window.location.reload()} />;
  }

  if (showInitialPageSkeleton) {
    return (
      <main dir={dir} className="relative mx-auto mt-8 px-4 sm:container lg:mt-16">
        <div className="flex flex-wrap justify-between gap-y-6">
          <aside className="order-2 w-full md:order-1 md:w-32/96 lg:w-20/96">
            <FilterPanelSkeleton />
          </aside>
          <section className="order-1 w-full md:order-2 md:w-32/96 lg:w-75/96">
            <ProductsContentSkeleton count={skeletonCount} />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative mx-auto mt-8 px-4 sm:container lg:mt-16">
      <div className="flex flex-wrap justify-between gap-y-6">
        <FiltersSidebar
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
          expanded={expanded}
          toggleSection={toggleSection}
          hasOffer={hasOffer}
          setHasOffer={setHasOffer}
          hasActiveFilters={hasActiveFilters}
          handleClearFilters={handleClearFilters}
        />

        <section className="w-full md:w-32/96 lg:w-75/96">
          {showProductsSkeleton ? (
            <ProductsContentSkeleton count={skeletonCount} />
          ) : hasProducts ? (
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  getImageUrl={getImageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-first-100/70 bg-color-for-layer-on-body p-8 text-center first-text-color-for-paragraph">
              {t('product.noProducts')}
            </div>
          )}

          <div ref={loadMoreRef} className="mt-4 flex h-16 justify-center">
            {isFetchingNextPage && <Spinner />}
          </div>
        </section>
      </div>
    </main>
  );
}
