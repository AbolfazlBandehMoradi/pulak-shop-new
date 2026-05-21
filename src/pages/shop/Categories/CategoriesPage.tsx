import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Category } from '@/types';
import useCategories from '@/hooks/useCategories';
import { useLangStore } from '@/stores/languageStore';
import PageLoader from '@/components/ui/PageLoader';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

const ChildCategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);
  const localizedPath = useLocalizedPath();

  return (
    <Link
      to={category.productCount! > 0 ? localizedPath(`/products?categoryIds=${category.id}`) : '#'}
      className={`mt-2 block w-full break-inside-avoid rounded-lg bg-color-for-layer-on-body ${
        category.productCount! > 0 ? 'cursor-pointer hover:shadow-md' : 'pointer-events-none opacity-50'
      }`}
    >
      <div className="flex h-full w-full items-center px-3 py-2">
        <div className="h-full w-8/48">
          <img
            src={category.image || 'https://panell.pulakshop.ir/site-assets/gallery/no-image.png'}
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
        {category.productCount! > 0 && (
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
  const hasChildren = (category.children || []).length > 0;

  return (
    <div className="parent-card w-full break-inside-avoid rounded-xl bg-color-for-layer-sec p-4">
      <button
        type="button"
        className="flex w-full items-center"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-4/48 rounded-lg bg-color-for-layer-on-body">
          <img
            src={category.image || 'https://panell.pulakshop.ir/site-assets/gallery/no-image.png'}
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
        {!hasChildren && category.productCount! > 0 && (
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
          {category.children
            ?.slice()
            .sort((a, b) => (b.productCount! > 0 ? 1 : 0) - (a.productCount! > 0 ? 1 : 0))
            .map((child) => (
              <ChildCategoryCard key={child.id} category={child} />
            ))}
          {category.productCount! > 0 && (
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
    <main dir={dir} className="mx-auto mt-8 px-4 sm:container lg:mt-16">
      <div className="rounded-3xl bg-color-for-layer-on-body p-6">
        <div className="mb-6 flex w-full items-center gap-3 lg:w-6/12">
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
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-4"
            columnClassName="flex flex-col gap-4"
          >
            {categories
              .slice()
              .sort((a, b) => (b.productCount! > 0 ? 1 : 0) - (a.productCount! > 0 ? 1 : 0))
              .map((category) => (
                <ParentCategoryCard key={category.id} category={category} />
              ))}
          </Masonry>
        ) : (
          <p className="text-center text-gray-500">{t('categories.empty')}</p>
        )}
      </div>
    </main>
  );
};

export default AllCategoriesPage;
