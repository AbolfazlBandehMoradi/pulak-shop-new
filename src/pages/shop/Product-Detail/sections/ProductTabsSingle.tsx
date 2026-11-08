import { useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductDetail } from '@/utils/shopApi';
import cleanText from '@/utils/cleanText';
import cleanFaqHtml from '@/utils/cleanFaqHtml';
import { cn } from '@/utils/cn';
import '../../../../assets/styles/tiptap-content.css';
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
            {translation?.description ? (
              <p
                id="product-description"
                className="mt-2 whitespace-normal break-words leading-7 first-text-color-for-paragraph [overflow-wrap:anywhere]"
                dangerouslySetInnerHTML={{
                  __html: cleanText(translation.description, true)
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/\u00A0/g, ' '),
                }}
              />
            ) : (
              <p
                id="product-description"
                className="mt-2 whitespace-normal break-words leading-7 first-text-color-for-paragraph [overflow-wrap:anywhere]"
              >
                {t('product.noDescription') || 'No description available.'}
              </p>
            )}
          </div>

          {product?.faqs?.some((faq) => faq.isActive) && (
            <section className="mt-12">
              <div className="mb-6 flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold first-text-color">
                    {t('product.faq') || 'Frequently Asked Questions'}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    پاسخ به سوالات متداول درباره این محصول
                  </p>
                </div>
              </div>

              <div className="p-4 bg-first rounded-2xl">
                {[...product.faqs]
                  .filter((faq) => faq.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((faq, index) => (
                    <details
                      key={`${faq.question}-${index}`}
                      className="group overflow-hidden first:rounded-t-2xl last:rounded-b-2xl border-b   border-gray-200/70  bg-white last:border-none transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 dark:border-gray-800"
                    >
                      <summary className="flex cursor-pointer dark:bg-first-300 bg-first-950 list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl  bg-gray-100 text-xs font-bold text-gray-500 dark:text-black transition-colors group-open:bg-primary/10 group-open:text-primary dark:bg-white ">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-semibold leading-7 dark:text-gray-950 text-gray-50 ">
                            {faq.question}
                          </span>
                        </div>

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-300 group-open:rotate-180 group-open:bg-primary group-open:text-first dark:bg-white">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </summary>
                      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <div className=" p-8 border-t border-dashed border-gray-200  dark:border-gray-800">
                            <div
                              className="tiptap-content"
                              dangerouslySetInnerHTML={{
                                __html: cleanFaqHtml(faq.answer),
                              }}
                            />

                            {faq.videoUrl && (
                              <a
                                href={faq.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-white"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m10 8 6 4-6 4V8Z"
                                  />
                                  <circle cx="12" cy="12" r="9" />
                                </svg>
                                مشاهده ویدئو
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
              </div>
            </section>
          )}

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
