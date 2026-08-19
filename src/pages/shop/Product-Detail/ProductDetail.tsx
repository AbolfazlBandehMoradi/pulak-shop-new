import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
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
import { CopyLinkButton } from '../../../components/ui/CopyLinkButton';
import { ShareLinkButton } from '@/components/ui/ShareLinkButton';
import OurValue from '@/components/reusable-components/OurValue/OurValue';
import { resolveProductSaleOffer } from '@/utils/productOffer';
import { ProductOfferBanner } from './sections/ProductOfferBanner';
import { MediaFile, ProductImage } from '@/utils/shopApi';

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

  function normalizeGalleryImage(
    image: MediaFile | ProductImage | null | undefined,
  ): MediaFile | null {
    if (!image) return null;

    if ('mediaFile' in image) {
      return image.mediaFile ?? null;
    }

    if ('filePath' in image && image.filePath) {
      return image;
    }

    return null;
  }

  const galleryImages = useMemo(
    () =>
      (product?.images ?? [])
        .map((image) => normalizeGalleryImage(image))
        .filter((image): image is MediaFile => Boolean(image?.filePath)),
    [product?.images],
  );

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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const saleOffer = useMemo(
    () =>
      resolveProductSaleOffer({
        product,
        currentPrice,
        selectedVariant,
        languageCode: lang,
      }),
    [currentPrice, lang, product, selectedVariant],
  );

  return (
    <section className="page-container page-section">
      <div
        className={cn(
          'rounded-3xl bg-color-for-layer-on-body p-4 shadow-dark-sm sm:p-6 lg:p-10',
          saleOffer.isTimedOffer && 'ring-1 ring-third/25',
        )}
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <ProductBreadcrumb
              loading={loading}
              isRTL={isRTL}
              product={product}
              productName={translation?.name}
            />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs lg:w-30">
            {/* <AddToWishlistButton productId={productId ? String(productId) : ''} /> */}
            {/* <CompareButton productId={productId ? String(productId) : ''} /> */}
            <CopyLinkButton url={currentUrl} />
            <ShareLinkButton url={currentUrl} title={translation?.name || ''} />
          </div>
        </div>
        <div className="mt-4">
          {loading && !product ? (
            <ProductDetailSkeleton />
          ) : error || !product ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="min-w-0 text-center">
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
              <ProductOfferBanner offer={saleOffer} languageCode={lang} className="mb-5" />
              <div className="mb-12 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
                <motion.section
                  className="min-w-0 lg:col-span-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ProductGallery
                    images={galleryImages}
                    mainImage={product.mainImage}
                    productName={translation?.name}
                    loading={loading}
                    lang={lang}
                  />
                </motion.section>

                <motion.section
                  className="min-w-0 lg:col-span-5"
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
                  className="hidden min-w-0 lg:col-span-4 lg:block"
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
              <div className="mb-12">
                <OurValue />
              </div>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <ProductTabsSingle product={product} />
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
                  productSlug={product.slug}
                  initialRelatedProducts={product.relatedProducts}
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
