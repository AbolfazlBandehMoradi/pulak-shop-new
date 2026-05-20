import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import useCartStore from '@/stores/cartStore';
import ProductDetailSkeleton from './sections/ProductDetailSkeleton';
import { ProductGallery } from './sections/ProductGallery';
import { ProductInfo } from './sections/ProductInfo';
import { ProductBuyBox } from './sections/ProductBuyBox';
import { ProductTabsSingle } from './sections/ProductTabsSingle';
import { ProductReviews } from './sections/ProductReviews';
import { RelatedProducts } from './sections/RelatedProducts';
import { MobileStickyBar } from './sections/MobileStickyBar';
import { useProductDetails } from '@/hooks/useProductDetails';
import { ProductBreadcrumb } from './sections/ProductBreadcrumb';
import { AddToCartSuccessModal } from './sections/AddToCartSuccessModal';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { AddToWishlistButton } from '@/components/ui/AddToWishlistButton';
import { CompareButton } from '@/components/ui/CompareButton';
import { CopyLinkButton } from '../../../components/ui/CopyLinkButton';
import OurValue from '@/components/reusable-components/OurValue/OurValue';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useLocalizedNavigate();
  const lang = useLangStore((state) => state.lang);
  const isRTL = lang === 'fa';
  const { t } = useTranslation();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const {
    product,
    loading,
    error,
    selectedVariant,
    setSelectedVariant,
    currentPrice,
    currentInventory,
    isInStock,
  } = useProductDetails(slug, lang);

  const productId = product?.id;

  const cartItem = useCartStore((store) => {
    if (!productId) return undefined;
    return store.getItemByProduct(productId, selectedVariant ?? undefined);
  });

  const singleVariantInCart = useCartStore((store) => {
    if (!productId) return null;
    return store.getSingleVariantInCart(productId);
  });

  useEffect(() => {
    if (!product?.variants?.length) return;
    if (selectedVariant !== null) return;
    if (singleVariantInCart === null) return;

    const hasActiveCartVariant = product.variants.some(
      (variant) => variant.id === singleVariantInCart && variant.isActive,
    );
    if (hasActiveCartVariant) {
      setSelectedVariant(singleVariantInCart);
    }
  }, [product, selectedVariant, setSelectedVariant, singleVariantInCart]);

  const translation = useMemo(() => {
    if (!product) return null;
    return product.translation ?? product.translations?.[0];
  }, [product]);
  console.log(product);
  return (
    <section className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <div className="rounded-3xl bg-color-for-layer-on-body p-4 lg:p-12">
        <div className="flex flex-wrap">
          <div className="lg:w-72/96 w-full">
            <ProductBreadcrumb
              loading={loading}
              isRTL={isRTL}
              product={product}
              productName={translation?.name}
            />
          </div>
          <div className="w-full mt-4 lg:mt-0 justify-between lg:justify-end lg:gap-2 flex flex-wrap lg:w-24/96">
            <div className="w-31/96 lg:w-20/96 xl:w-15/96 2xl:w-12/96">
              <AddToWishlistButton productId={''} />
            </div>
            <div className="w-31/96 lg:w-20/96 xl:w-15/96 2xl:w-12/96">
              <CompareButton productId={''} />{' '}
            </div>
            <div className="w-31/96 lg:w-20/96 xl:w-15/96 2xl:w-12/96">
              <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : ''} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          {loading && !product ? (
            <ProductDetailSkeleton />
          ) : error || !product ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold first-text-color">
                  {t('product.notFound') || 'Product Not Found'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/products')}
                  className={cn(
                    'bg-red-500 text-white transition-colors hover:bg-red-600',
                    isRTL ? 'flex-row-reverse' : 'flex-row',
                  )}
                >
                  <ChevronLeft className={cn('h-4 w-4', isRTL ? 'rotate-0' : 'rotate-180')} />
                  {t('common.back') || 'Back'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-16 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
                <motion.section
                  className="lg:col-span-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ProductGallery
                    images={product.images || []}
                    mainImage={product.mainImage}
                    productName={translation?.name}
                    loading={loading}
                    lang={lang}
                  />
                </motion.section>

                <motion.section
                  className="lg:col-span-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ProductInfo
                    product={product}
                    loading={loading}
                    languageCode={lang}
                    effectiveLangCode={lang}
                  />
                </motion.section>

                <motion.section
                  className="hidden lg:col-span-4 lg:block"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ProductBuyBox
                    product={product}
                    loading={loading}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                    showAnimationOnAdd={setShowSuccessAnimation}
                    cartItem={cartItem}
                    currentPrice={currentPrice}
                    currentInventory={currentInventory}
                    isInStock={isInStock}
                    languageCode={lang}
                  />
                </motion.section>
              </div>
              <div className="mb-16">
                <OurValue />
              </div>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <ProductTabsSingle
                  product={product}
                  loading={loading}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                  showAnimationOnAdd={setShowSuccessAnimation}
                  cartItem={cartItem}
                  currentPrice={currentPrice}
                  currentInventory={currentInventory} // <--- این خیلی مهمه
                  isInStock={isInStock} // <--- این هم مهمه
                  languageCode={lang}
                />
              </motion.section>

              <motion.section
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <ProductReviews
                  productSlug={product.slug}
                  languageCode={lang}
                  initialReviews={product.reviews}
                  initialReviewCount={product.reviewCount}
                  initialAverageRating={product.averageRating}
                  initialRatingDistribution={product.ratingDistribution}
                />
              </motion.section>

              <motion.section
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <RelatedProducts
                  relatedProducts={product.relatedProducts}
                  languageCode={lang}
                  loading={loading}
                />
              </motion.section>
            </>
          )}
        </div>
      </div>

      {product && currentPrice && (
        <MobileStickyBar
          product={product}
          cartItem={cartItem}
          currentPrice={currentPrice}
          currentInventory={currentInventory}
          isInStock={isInStock}
          languageCode={lang}
          showAnimationOnAdd={setShowSuccessAnimation}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />
      )}

      <AddToCartSuccessModal
        isOpen={showSuccessAnimation}
        onClose={() => setShowSuccessAnimation(false)}
        onViewCart={() => {
          setShowSuccessAnimation(false);
          navigate('/cart');
        }}
      />
    </section>
  );
}
