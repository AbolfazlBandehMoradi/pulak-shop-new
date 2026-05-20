import { useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
// تایپ‌های قیمت و موجودی رو اینجا اضافه کن
import type { ProductDetail, ProductPrice, ProductInventory } from '@/utils/shopApi';
import cleanText from '@/utils/cleanText';
import { ProductBuyBox } from './ProductBuyBox';
import { cn } from '@/utils/cn';
interface ProductTabsProps {
  product: ProductDetail | null;
  loading?: boolean;
  selectedVariant: number | null;
  onVariantChange: (variantId: number | null) => void;
  showAnimationOnAdd: (arg: boolean) => void;
  currentPrice: ProductPrice | null;
  currentInventory: ProductInventory | null;
  isInStock: boolean;
  languageCode: string;
  cartItem: { id: number; quantity: number } | undefined;
}

// پراپ‌ها رو از ورودی دریافت می‌کنیم
export function ProductTabsSingle({
  product,
  loading,
  selectedVariant,
  onVariantChange,
  showAnimationOnAdd,
  currentPrice,
  currentInventory,
  isInStock,
  languageCode,
  cartItem,
}: ProductTabsProps) {
  const { t } = useTranslation();

  const translation = product?.translation || product?.translations?.[0];

  // Safe arrays
  const attributeValues = product?.attributeValues ?? [];
  const categories = product?.categories ?? [];
  const tags = product?.tags ?? [];

  // Parse specifications safely
  const specificationEntries = useMemo(() => {
    if (!product?.specificationsJson) return [];

    try {
      const data = JSON.parse(product.specificationsJson);
      return Object.entries(data || {});
    } catch {
      return [];
    }
  }, [product?.specificationsJson]);

  // ===== UI COMPONENTS =====

  const rows = useMemo(() => {
    const base = [
      ...attributeValues.map((attr) => ({
        label: attr.attributeName,
        value: attr.customValue ?? attr.optionLabel ?? attr.optionValue ?? '-',
      })),

      ...(categories.length > 0
        ? [
            {
              label: t('product.category') || 'Category',
              value: categories.map((c) => c.name).join(' / '),
            },
          ]
        : []),

      ...(product?.translation?.countryOfOriginDisplay
        ? [
            {
              label: t('product.country') || 'Country',
              value: product.translation.countryOfOriginDisplay,
            },
          ]
        : []),

      ...(product?.translation?.moneyBackPolicy
        ? [
            {
              label: t('product.return') || 'Return',
              value: product.translation.moneyBackPolicy,
            },
          ]
        : []),

      ...(product?.translation?.shippingLeadTime
        ? [
            {
              label: t('product.shippingTime') || 'Shipping Time',
              value: product.translation.shippingLeadTime,
            },
          ]
        : []),

      ...(product?.vendorName
        ? [
            {
              label: t('product.seller') || 'Vendor',
              value: product.vendorName,
            },
          ]
        : []),

      ...(product?.warrantyType
        ? [
            {
              label: t('product.warranty') || 'Warranty',
              value: product.warrantyType,
            },
          ]
        : []),

      ...specificationEntries.map(([key, value]) => ({
        label: key,
        value: String(value),
      })),

      ...(product?.translation?.shippingMethodsDescription
        ? [
            {
              label: t('product.shipping') || 'Shipping',
              value: product.translation.shippingMethodsDescription,
            },
          ]
        : []),

      ...(tags.length > 0
        ? [
            {
              label: t('product.tags') || 'Tags',
              value: tags.map((tag) => `#${tag.name}`).join(' '),
            },
          ]
        : []),
    ];

    return base;
  }, [product, attributeValues, categories, tags, specificationEntries, t]);
  return (
    <div className="flex justify-between flex-wrap">
      <div
        className={cn(
          'w-full', // کلاسی که همیشه اعمال میشه
          isInStock
            ? 'lg:w-68/96' // کلاس‌هایی که وقتی کالا "موجود" هست اعمال میشه
            : 'lg:w-full', // کلاس‌هایی که وقتی کالا "ناموجود" هست اعمال میشه
        )}
      >
        <div className="mb-8 ">
          <div>
            <h2 className="w-full font-s-bold first-text-color text-xl ">
              {t('product.description')}
            </h2>
            <p className="mt-2 leading-7 first-text-color-for-paragraph">
              {translation?.description
                ? cleanText(translation.description)
                : t('product.noDescription') || 'No description available.'}
            </p>
          </div>
          <div>
            <h3 className="w-full font-s-medium first-text-color text-lg mt-4 mb-2">
              {t('product.specificationsProduct')}
            </h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800">
            {rows.map((row, i) => {
              const isEvenRow = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 transition-colors',
                    isEvenRow
                      ? 'bg-color-for-layer-on-body dark:bg-gray-800/20'
                      : 'bg-color-for-layer-sec dark:bg-transparent',
                  )}
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {row.label}
                  </span>

                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-[60%]">
                    {row.value ?? '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isInStock && (
        <div className="w-full border border-gray-300 rounded-xl lg:w-26/96 p-4 lg:sticky lg:top-28 lg:self-start">
          <h2 className="text  first-text-color">{product?.translation?.name}</h2>
          <ProductBuyBox
            product={product}
            loading={loading}
            selectedVariant={selectedVariant}
            onVariantChange={onVariantChange}
            showAnimationOnAdd={showAnimationOnAdd}
            cartItem={cartItem}
            currentPrice={currentPrice}
            currentInventory={currentInventory}
            isInStock={isInStock}
            languageCode={languageCode}
            isCompact={true}
            className="bg-transparent p-0"
          ></ProductBuyBox>
        </div>
      )}
    </div>
  );
}
