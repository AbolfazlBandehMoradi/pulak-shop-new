import { useEffect, useMemo, useState } from 'react';
import Masonry from 'react-masonry-css';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types';
import useCategories from '@/hooks/useCategories';
import { useLangStore } from '@/stores/languageStore';
import PageLoader from '@/components/ui/PageLoader';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { getCategoryChildren } from '@/utils/categoryHelpers';
import { ChevronLeft, Smartphone } from 'lucide-react';

const CATEGORY_FALLBACK_IMAGE = 'https://panell.pulakshop.ir/site-assets/gallery/no-image.png';

const hasProducts = (category: Category) => (category.productCount ?? 0) > 0;
const sortByAvailability = (a: Category, b: Category) =>
  Number(hasProducts(b)) - Number(hasProducts(a));

const ChildCategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);
  const localizedPath = useLocalizedPath();
  const isClickable = hasProducts(category);

  return (
    <Link
      to={isClickable ? localizedPath(`/products?categoryIds=${category.id}`) : '#'}
      className={`mt-2 block w-full break-inside-avoid rounded-lg bg-color-for-layer-on-body ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'pointer-events-none opacity-50'
      }`}
    >
      <div className="flex h-full w-full items-center px-3 py-2">
        <div className="h-full w-8/48">
          <img
            src={category.image || CATEGORY_FALLBACK_IMAGE}
            alt={category.name}
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
        <div className="mr-3 w-36/48">
          <h4 className="first-text-color">{category.name}</h4>
          <p
            className={`text-xs font-f-light ${
              category.productCount === 0
                ? 'first-text-color-red'
                : 'first-text-color-for-paragraph'
            }`}
          >
            {category.productCount === 0
              ? t('categories.noProductsInCategory')
              : `${category.productCount} ${t('categories.productLabel')}`}
          </p>
        </div>
        {isClickable && (
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-first ${
              dir === 'ltr' ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 4L7 12L15 20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
};

const ParentCategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const children = getCategoryChildren(category);
  const hasChildren = children.length > 0;

  return (
    <div className="parent-card w-full break-inside-avoid rounded-xl bg-color-for-layer-sec p-4">
      <button
        type="button"
        className="flex w-full items-center"
        onClick={() => {
          hasChildren && setIsOpen(!isOpen);
          if (!hasChildren && hasProducts(category)) {
            navigate(localizedPath(`/products?categoryIds=${category.id}`));
          }
        }}
      >
        <div className="w-4/48 rounded-lg bg-color-for-layer-on-body">
          <img
            src={category.image || CATEGORY_FALLBACK_IMAGE}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex w-42/48 flex-col">
          <h3 className="first-text-color">{category.name}</h3>
          <p
            className={`text-xs font-f-light ${
              category.productCount === 0
                ? 'first-text-color-red'
                : 'first-text-color-for-paragraph'
            }`}
          >
            {category.productCount === 0
              ? t('categories.noProductsInCategory')
              : `${category.productCount} ${t('categories.productLabel')}`}
          </p>
        </div>
        <div className="w-2/48">
          {hasChildren && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {!hasChildren && hasProducts(category) && (
          <Link
            to={localizedPath(`/products?categoryIds=${category.id}`)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-first"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 4L7 12L15 20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
          {children
            ?.slice()
            .sort(sortByAvailability)
            .map((child) => (
              <ChildCategoryCard key={child.id} category={child} />
            ))}
          {hasProducts(category) && (
            <Link
              to={localizedPath(`/products?categoryIds=${category.id}`)}
              className="col-span-full mt-2 rounded-lg bg-first py-3 text-center text-white"
            >
              {t('categories.viewAllProducts')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const MobileCategoriesSplitView: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);
  const localizedPath = useLocalizedPath();
  const sortedParents = useMemo(() => categories.slice().sort(sortByAvailability), [categories]);
  const [activeParentId, setActiveParentId] = useState<string | null>(sortedParents[0]?.id ?? null);

  useEffect(() => {
    if (sortedParents.length === 0) {
      setActiveParentId(null);
      return;
    }

    if (!activeParentId || !sortedParents.some((category) => category.id === activeParentId)) {
      setActiveParentId(sortedParents[0].id);
    }
  }, [activeParentId, sortedParents]);

  const activeParent =
    sortedParents.find((category) => category.id === activeParentId) ?? sortedParents[0];
  const activeChildren = useMemo(
    () => (activeParent ? getCategoryChildren(activeParent).slice().sort(sortByAvailability) : []),
    [activeParent],
  );

  return (
    <section className="md:hidden">
      <p className="mb-2 border-y border-gray-200/60 py-2 text-center text-xs first-text-color-for-paragraph">
        {activeParent ? `${t('categories.title')} ${activeParent.name}` : t('categories.title')}
      </p>

      {activeParent && (
        <div
          className={`mb-3 flex items-center gap-1 text-[11px] text-first ${
            dir === 'rtl' ? 'justify-end' : 'justify-start'
          }`}
        >
          <ChevronLeft
            className={`h-3.5 w-3.5 ${dir === 'ltr' ? 'rotate-180' : ''}`}
            strokeWidth={1.7}
          />
          <Link to={localizedPath(`/products?categoryIds=${activeParent.id}`)} className="truncate">
            {t('categories.viewAllProducts')}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <div className={dir === 'rtl' ? 'order-2' : 'order-1'}>
          <div className="space-y-2">
            {activeChildren.length > 0 ? (
              activeChildren.map((child) =>
                hasProducts(child) ? (
                  <Link
                    key={child.id}
                    to={localizedPath(`/products?categoryIds=${child.id}`)}
                    className="flex items-center justify-between rounded-lg bg-color-for-layer-sec px-3 py-3 text-sm first-text-color"
                  >
                    <span className="truncate">{child.name}</span>
                    <ChevronLeft
                      className={`h-4 w-4 shrink-0 first-text-color-for-paragraph-low ${
                        dir === 'ltr' ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.9}
                    />
                  </Link>
                ) : (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-lg bg-color-for-layer-sec px-3 py-3 text-sm first-text-color-for-paragraph-low opacity-65"
                  >
                    <span className="truncate">{child.name}</span>
                    <ChevronLeft
                      className={`h-4 w-4 shrink-0 ${dir === 'ltr' ? 'rotate-180' : ''}`}
                      strokeWidth={1.9}
                    />
                  </div>
                ),
              )
            ) : (
              <p className="rounded-lg bg-color-for-layer-sec px-3 py-3 text-sm first-text-color-for-paragraph">
                {t('categories.noProductsInCategory')}
              </p>
            )}
          </div>
        </div>

        <div className={dir === 'rtl' ? 'order-1' : 'order-2'}>
          <div className="rounded-xl border border-gray-200/60 bg-color-for-layer-on-body">
            {sortedParents.map((parent, index) => {
              const isActive = parent.id === activeParent?.id;

              return (
                <button
                  key={parent.id}
                  type="button"
                  onClick={() => setActiveParentId(parent.id)}
                  className={`flex w-full items-center gap-2 px-2 py-2 text-start transition-colors ${
                    isActive ? 'bg-first/10' : ''
                  } ${index !== sortedParents.length - 1 ? 'border-b border-gray-200/60' : ''}`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gray-200/80 bg-color-for-layer-sec">
                    {parent.image ? (
                      <img
                        src={parent.image}
                        alt={parent.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <Smartphone className="h-3.5 w-3.5 text-first" strokeWidth={1.8} />
                    )}
                  </span>
                  <span
                    className={`line-clamp-2 text-[11px] leading-4 ${
                      isActive ? 'font-f-sbold text-first' : 'first-text-color-for-paragraph'
                    }`}
                  >
                    {parent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const AllCategoriesPage = () => {
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) return <PageLoader />;

  const breakpointColumnsObj = {
    default: 2,
    1200: 2,
    992: 2,
    576: 1,
  };

  return (
    <main dir={dir} className="mx-auto mt-2 max-w-7xl px-0 md:px-6 lg:mt-16">
      <div className="bg-color-for-layer-on-body p-2 md:rounded-3xl md:p-6">
        <div className="mb-6 hidden w-full items-center gap-3 md:flex lg:w-6/12">
          <span className="first-text-color-svg inline-block rounded-lg p-3">
            <svg className="h-6 w-6 lg:h-16 lg:w-16" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 8H16M8 12H16M8 16H12M3.5 12C3.5 5.5 5.5 3.5 12 3.5C18.5 3.5 20.5 5.5 20.5 12C20.5 18.5 18.5 20.5 12 20.5C5.5 20.5 3.5 18.5 3.5 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="text-2xl font-bold first-text-color">{t('categories.title')}</h2>
          </div>
        </div>

        {isError ? (
          <p className="grid h-72 place-items-center rounded-2xl bg-gray-300">
            {t('categories.loadError')}
          </p>
        ) : categories && categories.length > 0 ? (
          <>
            <MobileCategoriesSplitView categories={categories} />

            <div className="hidden md:block">
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex gap-4"
                columnClassName="flex flex-col gap-4"
              >
                {categories
                  .slice()
                  .sort(sortByAvailability)
                  .map((category) => (
                    <ParentCategoryCard key={category.id} category={category} />
                  ))}
              </Masonry>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">{t('categories.empty')}</p>
        )}
      </div>
    </main>
  );
};

export default AllCategoriesPage;
