import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { FilterItemsSkeleton } from './FilterPageSkeletons';
import CategoryTree from './CategoryTree';
import { type Category } from '@/types';

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

  return (
    <aside className="w-full md:w-32/96 lg:w-20/96">
      <div className="bg-color-for-layer-on-body rounded-lg p-4 sticky top-4">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">{t('product.filters')}</h2>

          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-xs flex items-center gap-1">
              <X className="w-3 h-3" />
              {t('product.clear')}
            </button>
          )}
        </div>

        <button
          onClick={() => toggleSection('categories')}
          className="flex w-full justify-between py-2 font-medium text-sm"
        >
          {t('product.categories') || 'Categories'}

          {expanded.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded.categories && (
          isCategoriesLoading ? (
            <FilterItemsSkeleton rows={6} />
          ) : (
            <CategoryTree categories={categories} />
          )
        )}

        <div className="mt-4 border-t border-gray-200 pt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(hasOffer)}
              onChange={(e) => setHasOffer(e.target.checked ? true : undefined)}
              className="w-4 h-4 rounded border border-gray-400 checked:bg-first checked:border-first"
            />

            <span>{t('product.discount') || 'Only discounted products'}</span>
          </label>
        </div>

      </div>
    </aside>
  );
}