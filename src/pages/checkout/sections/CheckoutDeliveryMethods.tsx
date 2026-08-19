import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, PackageCheck, Truck } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import getImageUrl from '@/utils/getImageUrl';
import { cn } from '@/utils/cn';
import { localizeDigits } from '@/utils/numberFormat';
import type { CheckoutDeliveryMethod } from '@/utils/checkoutApi';

type TranslateFn = (key: string) => string | undefined;

interface CheckoutDeliveryMethodsProps {
  deliveryMethods: CheckoutDeliveryMethod[];
  selectedDeliveryMethodId: number | null;
  applyingDeliveryMethodId: number | null;
  languageCode: string;
  t: TranslateFn;
  onSelectDeliveryMethod: (deliveryMethodId: number) => void | Promise<void>;
}

function resolveDeliveryMethodIcon(icon?: string): string | null {
  const trimmedIcon = icon?.trim();
  if (!trimmedIcon) return null;

  if (/^https?:\/\//.test(trimmedIcon) || trimmedIcon.startsWith('/')) {
    return getImageUrl(trimmedIcon);
  }

  return null;
}

function getDeliveryWindowLabel(
  method: CheckoutDeliveryMethod,
  languageCode: string,
  t: TranslateFn,
): string | null {
  const minDays = Math.max(0, method.minDeliveryDays);
  const maxDays = Math.max(minDays, method.maxDeliveryDays);

  if (minDays === 0 && maxDays === 0) {
    return null;
  }

  const range = minDays === maxDays ? String(minDays) : `${minDays}-${maxDays}`;
  return `${localizeDigits(range, languageCode)} ${t('checkout.deliveryDays') || 'days'}`;
}

export function CheckoutDeliveryMethods({
  deliveryMethods,
  selectedDeliveryMethodId,
  applyingDeliveryMethodId,
  languageCode,
  t,
  onSelectDeliveryMethod,
}: CheckoutDeliveryMethodsProps) {
  if (deliveryMethods.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="product-detail-panel bg-white relative overflow-hidden px-4 py-10 text-center sm:p-12"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
        />
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="product-detail-soft-panel flex h-20 w-20 items-center justify-center">
            <Truck className="h-10 w-10 text-first" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-s-bold first-text-color">
              {t('checkout.noDeliveryMethods') || 'No delivery methods found'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed first-text-color-for-paragraph">
              {t('checkout.noDeliveryMethodsMessage') ||
                'Delivery methods are not available right now.'}
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-detail-panel bg-white rounded-lg border-first border-2 p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-first/10 text-first">
            <Truck className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-s-bold first-text-color">
              {t('checkout.deliveryMethod') || 'Delivery method'}
            </h2>
            <p className="text-xs first-text-color-for-paragraph-low">
              {t('checkout.selectDeliveryMethod') || 'Select delivery method'}
            </p>
          </div>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={t('checkout.deliveryMethod') || 'Delivery method'}
        className="space-y-3"
      >
        {deliveryMethods.map((method) => {
          const isSelected = selectedDeliveryMethodId === method.id;
          const isApplying = applyingDeliveryMethodId === method.id;
          const isDisabled = applyingDeliveryMethodId !== null;
          const iconUrl = resolveDeliveryMethodIcon(method.icon);
          const deliveryWindowLabel = getDeliveryWindowLabel(method, languageCode, t);

          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onSelectDeliveryMethod(method.id)}
              className={cn(
                'product-detail-soft-panel product-detail-focus group w-full cursor-pointer p-4 text-start transition-all hover:border-first/25 hover:bg-first/5 disabled:cursor-not-allowed disabled:opacity-70',
                isSelected && 'border-first bg-first/5 shadow-first-sm',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    isSelected
                      ? 'border-first bg-first'
                      : 'border-[color-mix(in_srgb,var(--first-text-color-svg)_28%,transparent)]',
                  )}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-color-for-layer-on-body p-2 text-first">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <PackageCheck className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-base font-s-bold first-text-color">
                        {method.name}
                      </span>
                      {method.description && (
                        <span className="mt-1 block text-sm leading-6 first-text-color-for-paragraph-low">
                          {method.description}
                        </span>
                      )}
                    </span>

                    <span className="shrink-0 rounded-md border border-secound/20 bg-secound/10 px-2.5 py-1 text-xs font-s-bold text-secound">
                      {method.baseCost > 0 ? (
                        <PriceDisplay amount={method.baseCost} languageCode={languageCode} />
                      ) : (
                        t('checkout.freeDelivery') || 'Free'
                      )}
                    </span>
                  </span>

                  <span className="mt-3 flex flex-wrap items-center gap-2 text-xs first-text-color-for-paragraph-low">
                    {deliveryWindowLabel && (
                      <span className="rounded-md bg-color-for-layer-on-body px-2.5 py-1">
                        {t('checkout.deliveryTime') || 'Delivery time'}: {deliveryWindowLabel}
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-first/10 px-2.5 py-1 font-s-bold text-first">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('checkout.selectedDeliveryMethod') || 'Selected'}
                      </span>
                    )}
                    {isApplying && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-first/10 px-2.5 py-1 font-s-bold text-first">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t('checkout.applyingDeliveryMethod') || 'Updating'}
                      </span>
                    )}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
