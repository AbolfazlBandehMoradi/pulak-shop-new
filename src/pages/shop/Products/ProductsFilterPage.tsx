import { X } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useShopStore } from '@/stores/productsFilterStore';
import useCategories from '@/hooks/useCategories';
import { type Category } from '@/types';
import { useLangStore } from '@/stores/languageStore';
import { type CatalogProduct } from '@/components/reusable-components/AllCategories/productView.types';
import { areSameStrings, parseCategoryIdsParam, parseHasOfferParam } from '@/utils/urlHelpers';
import { FilterPanelSkeleton, ProductsContentSkeleton } from './sections/FilterPageSkeletons';
import { getCategoryChildren } from '@/utils/categoryHelpers';
import FiltersSidebar from './sections/FiltersSidebar';
import { GridViewProduct } from './sections/GridViewProducts';
import Spinner from '@/components/ui/Spinner';
import ApiError from '@/pages/error/ApiError';

const GRID_SKELETON_COUNT = 9;
const MAX_GRID_SKELETON_COUNT = 12;

export default function ProductsFilterPage() {
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useCategories();
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);

  const {
    search,
    categoryIds,
    hasOffer,
    setSearch,
    setCategoryIds,
    setHasOffer,
    setFilters,
    clearFilters,
  } = useShopStore();

  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

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

  const showProductsSkeleton = (isLoading || isFetching) && !isFetchingNextPage;
  const skeletonCount = Math.min(
    Math.max(products.length, GRID_SKELETON_COUNT),
    MAX_GRID_SKELETON_COUNT
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasCompletedInitialLoadRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      hasCompletedInitialLoadRef.current = true;
    }
  }, [isLoading]);

  const showInitialPageSkeleton = !hasCompletedInitialLoadRef.current && isLoading;

  // ------------------ URL hydration ------------------
  useEffect(() => {
    try {
      const currentParams = new URLSearchParams(location.search);
      const nextSearch =
        (currentParams.get('search') ?? currentParams.get('q') ?? '').trim() || undefined;
      const nextCategoryIds = parseCategoryIdsParam(currentParams.get('categoryIds'));
      const parsedHasOffer = parseHasOfferParam(currentParams.get('hasOffer'));
      const nextHasOffer = parsedHasOffer === false ? undefined : parsedHasOffer;
      const currentFilters = useShopStore.getState();

      const hasChanged =
        nextSearch !== currentFilters.search ||
        !areSameStrings(nextCategoryIds, currentFilters.categoryIds) ||
        nextHasOffer !== currentFilters.hasOffer;

      if (hasChanged) {
        setFilters({
          search: nextSearch,
          categoryIds: nextCategoryIds,
          hasOffer: nextHasOffer,
        });
      }

      if (!isUrlHydrated) {
        setIsUrlHydrated(true);
      }
    } catch (err: any) {
      console.error('Error hydrating URL params:', err);
      setComponentError(err?.message ?? 'Failed to parse URL params.');
    }
  }, [isUrlHydrated, location.search, setFilters]);

  // ------------------ Update URL ------------------
  useEffect(() => {
    try {
      if (!isUrlHydrated) return;

      const nextParams = new URLSearchParams(location.search);

      if (search) nextParams.set('search', search);
      else nextParams.delete('search');

      nextParams.delete('q');

      if (categoryIds.length > 0) nextParams.set('categoryIds', categoryIds.join(','));
      else nextParams.delete('categoryIds');

      nextParams.delete('minPrice');
      nextParams.delete('maxPrice');

      if (hasOffer) nextParams.set('hasOffer', 'true');
      else nextParams.delete('hasOffer');

      const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
      if (nextParams.toString() !== currentSearch) {
        setSearchParams(nextParams, { replace: true });
      }
    } catch (err: any) {
      console.error('Error updating URL:', err);
      setComponentError(err?.message ?? 'Failed to update URL.');
    }
  }, [isUrlHydrated, location.search, setSearchParams, search, categoryIds, hasOffer]);

  // ------------------ Infinite scroll ------------------
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const handleClearFilters = () => {
    clearFilters();
    setSearchParams({});
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    categories: true,
  });

  const toggleSection = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasActiveFilters = categoryIds.length > 0 || Boolean(search) || Boolean(hasOffer);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();

    const visit = (items: Category[] = []) => {
      items.forEach((category) => {
        map.set(category.id, category.name);
        visit(getCategoryChildren(category));
      });
    };

    visit(categories ?? []);
    return map;
  }, [categories]);

  const activeFilterTags = useMemo(() => {
    const tags: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (search) {
      tags.push({
        key: 'search',
        label: `${t('nav.search') || 'Search'}: ${search}`,
        onRemove: () => setSearch(undefined),
      });
    }

    if (hasOffer) {
      tags.push({
        key: 'has-offer',
        label: t('product.discount') || 'Only discounted products',
        onRemove: () => setHasOffer(undefined),
      });
    }

    categoryIds.forEach((categoryId) => {
      tags.push({
        key: `category-${categoryId}`,
        label:
          categoryNameById.get(categoryId) ??
          `${t('product.categories') || 'Categories'}: ${categoryId}`,
        onRemove: () =>
          setCategoryIds(categoryIds.filter((id) => id !== categoryId)),
      });
    });

    return tags;
  }, [search, hasOffer, categoryIds, categoryNameById, t, setSearch, setHasOffer, setCategoryIds]);

  const getImageUrl = (product: CatalogProduct): string | null => {
    if (!product.mainImage?.filePath) return null;
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5299';
    return product.mainImage.filePath.startsWith('http')
      ? product.mainImage.filePath
      : `${base}${product.mainImage.filePath}`;
  };

  // ------------------ Error Handling ------------------
  if (componentError || isCategoriesError || isProductsError) {
    return <ApiError onRetry={() => window.location.reload()} />;
  }

  if (showInitialPageSkeleton) {
    return (
      <main className="relative sm:container mx-auto mt-8 lg:mt-16 px-4">
        <div className="flex flex-wrap justify-between">
          <aside className="w-full md:w-32/96 lg:w-20/96">
            <FilterPanelSkeleton />
          </aside>
          <section className="w-full md:w-32/96 lg:w-75/96">
            {/* <div className="flex mb-4">
              <div className="flex overflow-hidden rounded-lg border border-first-100 p-1 gap-1 bg-color-for-layer-on-body">
                <Skeleton className="w-8 h-8 bg-first-100" />
                <Skeleton className="w-8 h-8 bg-first-100" />
              </div>
            </div> */}
            <ProductsContentSkeleton count={skeletonCount} />
          </section>
        </div>
      </main>
    );
  }

  // ------------------ Main Render ------------------
  return (
    <main className="relative sm:container mx-auto mt-8 lg:mt-16 px-4">
      <div className="flex flex-wrap justify-between">
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
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeFilterTags.map((tag) => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={tag.onRemove}
                  className="inline-flex items-center gap-1 rounded-full border border-first-100 bg-color-for-layer-on-body px-3 py-1 text-xs first-text-color-for-paragraph transition-colors hover:border-first hover:text-first"
                >
                  <span>{tag.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {showProductsSkeleton ? (
            <ProductsContentSkeleton count={skeletonCount} />
          ) : (
            <GridViewProduct products={products} lang={lang} getImageUrl={getImageUrl} />
          )}

          <div ref={loadMoreRef} className="h-16 mt-4 flex justify-center">
            {isFetchingNextPage && <Spinner />}
          </div>
        </section>
      </div>
    </main>
  );
}
