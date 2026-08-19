import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation';
import ProductCard from '@/pages/shop/Products/sections/ProductCard';
import { getRelatedProducts, type RelatedProduct } from '@/utils/shopApi';
import type { CatalogProduct } from '@/types/productView.types';
import type { Language } from '@/types';

interface RelatedProductsProps {
  productSlug: string;
  initialRelatedProducts?: RelatedProduct[];
  languageCode: string;
  loading?: boolean;
}

const getImageUrl = (product: CatalogProduct) => {
  const filePath = product.mainImage?.filePath;
  if (!filePath) return null;

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299';
  return `${apiBaseUrl}${filePath}`;
};

const toCatalogProduct = (related: RelatedProduct, languageCode: string): CatalogProduct => {
  const product = related.relatedProduct;
  const price = product.price ?? 0;
  const salePrice = product.salePrice ?? null;
  const hasSalePrice = typeof salePrice === 'number' && salePrice > 0 && salePrice < price;

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    status: product.status,
    mainImage: product.mainImage ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    price,
    salePrice,
    currencyCode: product.currencyCode ?? '',
    currencySymbol: product.currencySymbol ?? '',
    discountPercent: product.discountPercent ?? null,
    isOnSale: product.isOnSale,
    stockQuantity: product.stockQuantity ?? 0,
    tracksInventory: true,
    isFavorite: false,
    hasWarranty: false,
    warrantyType: null,
    postalMethod: null,
    vendorName: null,
    authenticity: '',
    countryOfOriginCode: null,
    hasMoneyBackGuarantee: false,
    warrantyDurationValue: null,
    warrantyDurationUnit: '',
    freeShipping: false,
    fixedShippingPrice: null,
    allowsExchange: false,
    sellerKind: '',
    prices: [
      {
        id: product.id,
        productId: product.id,
        variantId: null,
        languageCode,
        currencyCode: product.currencyCode ?? '',
        currencySymbol: product.currencySymbol ?? '',
        price,
        salePrice,
        originalPrice: hasSalePrice ? price : null,
        discountPercent: product.discountPercent ?? null,
        hasSalePrice,
        isSaleActive: hasSalePrice,
        saleStartDateUtc: null,
        saleEndDateUtc: product.saleEndDateUtc ?? null,
        saleStartDate: null,
        saleStartTime: null,
        saleEndDate: product.saleEndDate ?? null,
        saleEndTime: null,
        saleStartDateShamsi: null,
        saleEndDateShamsi: null,
        cultureInfoName: null,
        dateTimeShortDatePattern: null,
        dateTimeShortTimePattern: null,
        costPrice: null,
        taxRate: null,
        isTaxIncluded: false,
      },
    ],
    attributeValuesWithDefinitions: [],
    translations: [
      {
        languageCode,
        name: product.name,
        slug: product.slug,
        shortDescription: product.mainImage?.alt ?? null,
        description: product.mainImage?.alt ?? null,
        metaTitle: null,
        metaDescription: null,
        countryOfOriginDisplay: null,
        moneyBackPolicy: null,
        warrantyTerms: null,
        shippingLeadTime: null,
        shippingMethodsDescription: null,
        shippingCostRemarks: null,
        exchangeTerms: null,
        authenticityNote: null,
      },
    ],
  };
};

export function RelatedProducts({
  productSlug,
  initialRelatedProducts,
  languageCode,
  loading,
}: RelatedProductsProps) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const relatedQuery = useQuery({
    queryKey: ['product-related', productSlug, languageCode],
    queryFn: () => getRelatedProducts(productSlug, languageCode),
    enabled: Boolean(productSlug),
    initialData: initialRelatedProducts,
  });

  const relatedProducts = relatedQuery.data ?? [];
  const products = useMemo(
    () => relatedProducts.map((related) => toCatalogProduct(related, languageCode)),
    [relatedProducts, languageCode],
  );

  const checkScrollability = () => {
    const node = scrollContainerRef.current;
    if (!node) return;

    const isRtl = getComputedStyle(node).direction === 'rtl';
    const normalizedLeft = isRtl ? Math.abs(node.scrollLeft) : node.scrollLeft;
    setCanScrollLeft(normalizedLeft > 4);
    setCanScrollRight(normalizedLeft < node.scrollWidth - node.clientWidth - 4);
  };

  const scroll = (direction: 'left' | 'right') => {
    const node = scrollContainerRef.current;
    if (!node) return;

    const isRtl = getComputedStyle(node).direction === 'rtl';
    const amount = node.clientWidth * 0.8;
    const signedAmount = direction === 'left' ? -amount : amount;

    node.scrollBy({
      left: isRtl ? -signedAmount : signedAmount,
      behavior: 'smooth',
    });

    window.setTimeout(checkScrollability, 250);
  };

  useEffect(() => {
    const timer = window.setTimeout(checkScrollability, 100);
    window.addEventListener('resize', checkScrollability);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [products.length]);

  if (loading || relatedQuery.isLoading) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-52" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-72 w-72 shrink-0 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="min-w-0 text-xl font-s-bold first-text-color">
          {t('product.relatedProducts') || 'Related Products'}
        </h2>
        <div dir='ltr' className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-first/10 bg-first/5 text-first transition hover:bg-first/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('productDetail.related.previousProducts') || 'Previous products'}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-first/10 bg-first/5 text-first transition hover:bg-first/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('productDetail.related.nextProducts') || 'Next products'}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[min(78vw,18rem)] shrink-0">
            <ProductCard
              product={product}
              lang={languageCode as Language}
              getImageUrl={getImageUrl}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
