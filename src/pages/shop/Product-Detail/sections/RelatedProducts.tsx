import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import type { RelatedProduct } from '@/utils/shopApi';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface RelatedProductsProps {
  relatedProducts: RelatedProduct[] | undefined;
  languageCode: string;
  loading?: boolean;
}

export function RelatedProducts({ relatedProducts, languageCode, loading }: RelatedProductsProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getImageUrl = (filePath?: string) => {
    if (!filePath) return null;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `${apiBaseUrl}${filePath}`;
  };

  const calculateDiscount = (price?: number, salePrice?: number) => {
    if (!price || !salePrice || price <= salePrice) return null;
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
    const scrollAmount = 336; // Card width (320px) + gap (16px)
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const newScroll =
      direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });

    // Update button visibility after scroll animation
    setTimeout(() => checkScrollability(), 300);
  };

  // Initialize scroll state and check on resize
  useEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      checkScrollability();
    }, 100);

    const handleResize = () => {
      setTimeout(() => checkScrollability(), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [relatedProducts]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <h2 className="w-full font-s-bold first-text-color text-xl mb-4 ">
        {t('product.relatedProducts') || 'Related Products'}
      </h2>
      <div className="relative">
        {/* Navigation Arrows */}
        {relatedProducts.length > 0 && (
          <>
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                aria-label="Next products"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        )}

        {/* Horizontal Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {relatedProducts.map((rel, index) => {
            const product = rel.relatedProduct;
            const imageUrl = getImageUrl(product.mainImage?.filePath);
            const discount = calculateDiscount(product.price, product.salePrice);
            const isLowStock =
              product.stockQuantity !== undefined &&
              product.stockQuantity > 0 &&
              product.stockQuantity <= 5;

            return (
              <motion.div
                key={rel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-80"
              >
                <Link
                  to={localizedPath(`/products/${product.slug}`)}
                  className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Special Sale Banner */}
                  {product.isOnSale && (
                    <div className="bg-red-600 text-white text-center py-1.5 text-sm font-bold">
                      {t('cart.specialSale') || 'Special Sale'}
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.mainImage?.alt || product.name}
                        className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground dark:text-gray-400 text-sm">
                          No image
                        </span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {discount && discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        {discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    {/* Brand (if available) */}
                    {/* Product Title */}
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] text-gray-900 dark:text-gray-100">
                      {product.name}
                    </h3>

                    {/* Description/Short Description */}
                    {product.mainImage?.alt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.mainImage.alt}
                      </p>
                    )}

                    {/* Delivery Info */}
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {t('product.fastDelivery') || 'Fast Delivery'}
                    </div>

                    {/* Stock Alert */}
                    {isLowStock && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        {t('product.lowStock') || 'Only'} {product.stockQuantity}{' '}
                        {t('product.itemsLeft') || 'items left in stock'}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-2">
                      {product.isOnSale && product.salePrice ? (
                        <>
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            <PriceDisplay amount={product.salePrice} languageCode={languageCode} />
                          </span>
                          {product.price && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              <PriceDisplay amount={product.price} languageCode={languageCode} />
                            </span>
                          )}
                        </>
                      ) : (
                        product.price && (
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            <PriceDisplay amount={product.price} languageCode={languageCode} />
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
