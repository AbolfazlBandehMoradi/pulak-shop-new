import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import useCategories from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { useLangStore } from '@/stores/languageStore';
import PageLoader from '@/components/ui/PageLoader';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { t } from 'i18next';

const ChildCategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const dir = useLangStore((s) => s.dir);
  const localizedPath = useLocalizedPath();
  return (
    <Link
      to={category.productCount! > 0 ? localizedPath(`/products?categoryIds=${category.id}`) : '#'}
      className={`block bg-color-for-layer-on-body rounded-lg mt-2 w-full break-inside-avoid
        ${category.productCount! > 0 ? 'hover:shadow-md cursor-pointer' : 'pointer-events-none opacity-50'}`}
    >
      <div className="flex h-full w-full items-center py-2 px-3">
        <div className="w-8/48 h-full">
          <img
            src={category.image || 'https://panell.pulakshop.ir/site-assets/gallery/no-image.png'}
            alt={category.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="w-36/48 mr-3">
          <h4 className="first-text-color">{category.name}</h4>
          <p
            className={`text-xs font-f-light ${
              category.productCount === 0
                ? 'first-text-color-red'
                : 'first-text-color-for-paragraph'
            }`}
          >
            {category.productCount === 0
              ? "محصولی در این دسته بندی وجود ندارد"
              : `${category.productCount} ${t('product.simplePorduct')}`}
          </p>
        </div>
        {category.productCount! > 0 && (
          <span
            className={`rounded-full w-6 h-6 flex justify-center items-center bg-first ${dir == 'ltr' ? 'rotate-180' : 'rotate-0'}`}
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

  const getAllCategoryIds = (cat: Category): string[] => {
    const ids = [cat.id];
    cat.children?.forEach((child) => ids.push(...getAllCategoryIds(child)));
    return ids;
  };

  return (
    <div className="bg-color-for-layer-sec p-4 rounded-xl break-inside-avoid w-full parent-card">
      <button
        type="button"
        className="flex items-center w-full"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-4/48 rounded-lg bg-color-for-layer-on-body">
          <img
            src={category.image || 'https://panell.pulakshop.ir/site-assets/gallery/no-image.png'}
            alt={category.name}
            className="w-full h-full object-cover"
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
              ? t('product.viewAllProducts')
              : `${category.productCount} ${t('product.simplePorduct')}`}
          </p>
        </div>
        <div className="w-2/48">
          {hasChildren && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
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
            className="rounded-full w-6 h-6 flex justify-center items-center bg-first"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
          {category.children
            ?.slice()
            .sort((a, b) => (b.productCount! > 0 ? 1 : 0) - (a.productCount! > 0 ? 1 : 0))
            .map((child) => (
              <ChildCategoryCard key={child.id} category={child} />
            ))}
          {category.productCount! > 0 && (
            <Link
              to={localizedPath(`/products?categoryIds=${category.id}`)}
              className="bg-first py-3 text-center rounded-lg mt-2 text-white col-span-full"
            >
              {t('product.viewAllProducts')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- صفحه اصلی ----------
const AllCategoriesPage = () => {
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategories(); // بدون جنریک، TS خودش تایپ رو می‌فهمه

  if (isLoading) return <PageLoader />;

  const breakpointColumnsObj = {
    default: 2,
    1200: 2,
    992: 2,
    576: 1,
  };

  return (
    <main dir={dir} className="mx-auto mt-8 lg:mt-16 px-4 sm:container">
      <div className="bg-color-for-layer-on-body rounded-3xl p-6">
        <div className="flex items-center gap-3 w-full lg:w-6/12 mb-6">
          <span className="first-text-color-svg inline-block rounded-lg p-3">
            <svg className="w-6 h-6 lg:w-16 lg:h-16" viewBox="0 0 24 24" fill="none">
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
            <h2 className="text-2xl first-text-color font-bold">
              <span>{t('product.categories')}</span>
              <span> </span>
              <span>{t('product.product')}</span>
            </h2>
          </div>
        </div>

        {isError ? (
          <p className="bg-gray-300 h-72 grid place-items-center rounded-2xl">
            خطا در دریافت دسته‌بندی‌ها
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
          <p className="text-gray-500 text-center">هیچ دسته‌بندی‌ای یافت نشد.</p>
        )}
      </div>
    </main>
  );
};

export default AllCategoriesPage;
