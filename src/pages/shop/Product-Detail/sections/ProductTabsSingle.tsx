import { useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductDetail } from '@/utils/shopApi';
import cleanText from '@/utils/cleanText';
import { cn } from '@/utils/cn';

interface ProductTabsProps {
  product: ProductDetail | null;
}

export function ProductTabsSingle({ product }: ProductTabsProps) {
  const { t } = useTranslation();
  const translation = product?.translation || product?.translations?.[0];
  const attributeValues = product?.attributeValues ?? [];
  const categories = product?.categories ?? [];
  const tags = product?.tags ?? [];

  const specificationEntries = useMemo(() => {
    if (!product?.specificationsJson) return [];

    try {
      const data = JSON.parse(product.specificationsJson);
      return Object.entries(data || {});
    } catch {
      return [];
    }
  }, [product?.specificationsJson]);

  const rows = useMemo(() => {
    return [
      ...attributeValues.map((attr) => ({
        label: attr.attributeName,
        value: attr.customValue ?? attr.optionLabel ?? attr.optionValue ?? '-',
      })),
      ...(categories.length > 0
        ? [
            {
              label: t('product.category') || 'Category',
              value: categories.map((category) => category.name).join(' / '),
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
  }, [product, attributeValues, categories, tags, specificationEntries, t]);

  return (
    <div className="flex min-w-0 flex-wrap justify-between gap-y-6">
      <div className="min-w-0 w-full">
        <div className="mb-8 min-w-0">
          <div className="min-w-0">
            <h2 className="w-full text-xl font-s-bold first-text-color">
              {t('product.description')}
            </h2>
            <p className="mt-2 whitespace-normal break-words leading-7 first-text-color-for-paragraph [overflow-wrap:anywhere]">
              {translation?.description
                ? cleanText(translation.description)
                : t('product.noDescription') || 'No description available.'}
            </p>
          </div>

          <h3 className="mb-2 mt-4 w-full text-lg font-s-medium first-text-color">
            {t('product.specificationsProduct')}
          </h3>

          <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800">
            {rows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className={cn(
                  'grid grid-cols-1 gap-1 px-4 py-3 transition-colors sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] sm:items-start',
                  index % 2 === 0 ? 'bg-color-for-layer-on-body' : 'bg-first/5',
                )}
              >
                <span className="min-w-0 break-words text-sm font-medium first-text-color-for-paragraph-low [overflow-wrap:anywhere]">
                  {row.label}
                </span>
                <span className="min-w-0 break-words text-sm first-text-color sm:text-right [overflow-wrap:anywhere]">
                  {row.value ?? '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
