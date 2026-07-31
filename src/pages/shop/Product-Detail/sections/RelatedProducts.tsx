import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff, ShoppingBag, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import type { ProductRelatedProduct, RelatedProduct, RelatedProductItem } from '@/utils/shopApi';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface RelatedProductsProps {
  relatedProducts: ProductRelatedProduct[] | undefined;
  languageCode: string;
  loading?: boolean;
}

function isWrappedRelatedProduct(rel: ProductRelatedProduct): rel is RelatedProduct {
  return 'relatedProduct' in rel;
}

function normalizeRelatedProduct(rel: ProductRelatedProduct): RelatedProductItem | null {
  const product = isWrappedRelatedProduct(rel) ? rel.relatedProduct : rel;

  if (!product?.id || !product.slug || !product.name) {
    return null;
  }

  return product;
}

export function RelatedProducts({ relatedProducts, languageCode, loading }: RelatedProductsProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const products =
    relatedProducts?.map(normalizeRelatedProduct).filter((product) => product !== null) ?? [];

  const getImageUrl = (filePath?: string) => {
    if (!filePath) return null;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${apiBaseUrl}${filePath}`;
  };

  const calculateDiscount = (price?: number | null, salePrice?: number | null) => {
    if (price == null || salePrice == null || price <= salePrice) return null;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = Math.min(scrollContainerRef.current.clientWidth * 0.85, 648);
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const newScroll =
      direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });

    window.setTimeout(() => checkScrollability(), 300);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      checkScrollability();
    }, 100);

    const handleResize = () => {
      window.setTimeout(() => checkScrollability(), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [relatedProducts]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-first-100" />
          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-9 w-9 rounded-lg bg-first-100" />
            <Skeleton className="h-9 w-9 rounded-lg bg-first-100" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`related-loading-${index}`}
              className="flex h-[26.5rem] w-72 shrink-0 flex-col rounded-lg border border-first-100/70 bg-color-for-layer-on-body p-3 sm:w-80"
            >
              <Skeleton className="h-44 w-full rounded-lg bg-first-100" />
              <div className="flex flex-1 flex-col justify-between pt-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full bg-first-100" />
                  <Skeleton className="h-5 w-4/5 bg-first-100" />
                  <Skeleton className="h-4 w-2/3 bg-first-100" />
                  <Skeleton className="h-4 w-1/2 bg-first-100" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full bg-first-100" />
                  <Skeleton className="h-10 w-full rounded-md bg-first-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-first/10 text-first">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-s-bold text-xl first-text-color">
              {t('product.relatedProducts') || 'Related Products'}
            </h2>
            <p className="mt-1 text-sm first-text-color-for-paragraph">
              {t('product.newestDescription') || 'Check out the latest additions to our store'}
            </p>
          </div>
        </div>

        {products.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="grid h-9 w-9 place-items-center rounded-lg border border-first-100 bg-color-for-layer-sec first-text-color-for-paragraph transition hover:border-first-300 hover:text-first disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('productDetail.related.previousProducts') || 'Previous products'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="grid h-9 w-9 place-items-center rounded-lg border border-first-100 bg-color-for-layer-sec first-text-color-for-paragraph transition hover:border-first-300 hover:text-first disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('productDetail.related.nextProducts') || 'Next products'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="scrollbar-hide -mx-1 flex items-stretch gap-4 overflow-x-auto px-1 pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product, index) => {
          const imageUrl = getImageUrl(product.mainImage?.filePath);
          const discount = calculateDiscount(product.price, product.salePrice);
          const stockQuantity = product.stockQuantity ?? null;
          const hasSalePrice =
            typeof product.price === 'number' &&
            typeof product.salePrice === 'number' &&
            product.salePrice > 0 &&
            product.salePrice < product.price;
          const currentPrice = hasSalePrice ? product.salePrice : product.price;
          const isLowStock = stockQuantity != null && stockQuantity > 0 && stockQuantity <= 5;
          const isOutOfStock = stockQuantity != null && stockQuantity <= 0;

          return (
            <motion.article
              key={`${product.id}-${product.slug}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex h-[26.5rem] w-72 shrink-0 sm:w-80"
            >
              <Link
                to={localizedPath(`/products/${product.slug}`)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-first-100/70 bg-color-for-layer-on-body p-3 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-first-300 hover:shadow-[0_16px_36px_-20px_rgba(27,126,251,0.35)]"
              >
                <div className="relative h-44 overflow-hidden rounded-lg border border-first-100/70 bg-color-for-layer-sec">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(27,126,251,0.12),rgba(16,185,129,0.08))]" />
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.mainImage?.alt || product.name}
                      className="relative z-10 h-full w-full object-contain p-3 drop-shadow-[0_12px_20px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 first-text-color-for-paragraph">
                      <ImageOff className="h-8 w-8 opacity-70" />
                      <span className="text-xs">
                        {t('productDetail.gallery.noImage') || 'No image'}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2">
                    {discount && discount > 0 ? (
                      <span className="rounded-md bg-color-for-red px-2 py-1 text-xs font-s-bold text-white">
                        {discount}%
                      </span>
                    ) : (
                      <span />
                    )}
                    {isOutOfStock && (
                      <span className="rounded-md bg-color-for-red px-2 py-1 text-xs text-white">
                        {t('product.outOfStock') || 'Out Of Stock'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between pt-3">
                  <div className="min-h-24">
                    <h3 className="line-clamp-2 min-h-10 font-s-medium first-text-color">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 first-text-color-for-paragraph">
                      {product.mainImage?.alt || ''}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex h-14 items-end justify-between gap-3">
                      <div className="min-w-0">
                        {typeof currentPrice === 'number' && (
                          <span className="text-lg font-s-bold first-text-color">
                            <PriceDisplay amount={currentPrice} languageCode={languageCode} />
                          </span>
                        )}
                        {hasSalePrice && typeof product.price === 'number' && (
                          <span className="mt-1 block text-sm first-text-color-for-paragraph-low line-through">
                            <PriceDisplay amount={product.price} languageCode={languageCode} />
                          </span>
                        )}
                      </div>

                      {isLowStock ? (
                        <span className="rounded-md bg-third/10 px-2 py-1 text-xs text-third">
                          {t('product.lowStock') || 'Only'} {stockQuantity}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-first/10 px-2 py-1 text-xs text-first">
                          <Truck className="h-3.5 w-3.5" />
                          {t('product.fastDelivery') || 'Fast Delivery'}
                        </span>
                      )}
                    </div>

                    <span className="flex items-center justify-between rounded-md bg-first px-3 py-2 text-sm text-white transition-colors group-hover:bg-first-600">
                      {t('mainpage.specials.viewProduct') || 'View Product'}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
