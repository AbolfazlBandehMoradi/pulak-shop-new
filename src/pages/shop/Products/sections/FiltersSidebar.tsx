import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { FilterItemsSkeleton } from './FilterPageSkeletons';
import CategoryTree from './CategoryTree';
import { type Category } from '@/types';
import { useLangStore } from '@/stores/languageStore';

type Props = {
  categories?: Category[];
  isCategoriesLoading: boolean;
  expanded: Record<string, boolean>;
  toggleSection: (key: string) => void;
  hasOffer?: boolean;
  setHasOffer: (value: boolean | undefined) => void;
  hasActiveFilters: boolean;
  handleClearFilters: () => void;
};

export default function FiltersSidebar({
  categories,
  isCategoriesLoading,
  expanded,
  toggleSection,
  hasOffer,
  setHasOffer,
  hasActiveFilters,
  handleClearFilters,
}: Props) {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);

  return (
    <aside className="w-full md:w-32/96 lg:w-20/96">
      <div
        dir={dir}
        className="sticky top-4 rounded-lg border border-first-100/70 bg-color-for-layer-on-body p-4 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-semibold first-text-color">{t('productsFilter.filters')}</h2>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs flex items-center gap-1 first-text-color-for-paragraph transition-colors hover:text-first"
            >
              <X className="w-3 h-3" />
              {t('productsFilter.clear')}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleSection('categories')}
          className="flex w-full items-center justify-between rounded-md py-2 text-sm font-medium first-text-color hover:text-first transition-colors"
        >
          {t('productsFilter.categories')}

          {expanded.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded.categories &&
          (isCategoriesLoading ? (
            <FilterItemsSkeleton rows={6} />
          ) : (
            <CategoryTree categories={categories} />
          ))}

        <div className="mt-4 border-t border-first-100 pt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none first-text-color-for-paragraph">
            <input
              type="checkbox"
              checked={Boolean(hasOffer)}
              onChange={(e) => setHasOffer(e.target.checked ? true : undefined)}
              className="h-4 w-4 rounded border border-first-300 checked:bg-first checked:border-first"
            />

            <span>{t('productsFilter.onlyDiscountedProducts')}</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
