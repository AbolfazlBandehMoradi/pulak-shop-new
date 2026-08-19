import type { ReactNode } from 'react';
import {
  ArrowRight,
  CheckCircle,
  ReceiptText,
  ShoppingCart,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { localizeDigits } from '@/utils/numberFormat';
import getImageUrl from '@/utils/getImageUrl';
import type { Cart } from '@/utils/cartApi';
import { cn } from '@/utils/cn';

type TranslateFn = (key: string) => string | undefined;

interface CheckoutSummaryProps {
  cart: Cart | null;
  languageCode: string;
  isRTL: boolean;
  t: TranslateFn;
  onContinue: () => void;
  continueDisabled?: boolean;
}

interface SummaryLineProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  highlight?: boolean;
}

function SummaryLine({ label, value, icon, highlight = false }: SummaryLineProps) {
  return (
    <div className="product-detail-divider flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <span
        className={cn(
          'flex min-w-0 items-center gap-2',
          highlight ? 'font-s-bold first-text-color' : 'text-sm first-text-color-for-paragraph',
        )}
      >
        {icon}
        <span className="min-w-0">{label}</span>
      </span>
      <span
        className={
          highlight
            ? 'text-lg font-s-bold first-text-color'
            : 'text-sm font-s-medium first-text-color'
        }
      >
        {value}
      </span>
    </div>
  );
}

export function CheckoutSummary({
  cart,
  languageCode,
  isRTL,
  t,
  onContinue,
  continueDisabled = false,
}: CheckoutSummaryProps) {
  const discountPercent =
    cart && cart.subtotal > 0 ? Math.round((cart.totalDiscount / cart.subtotal) * 100) : 0;
  const formattedDiscountPercent = localizeDigits(discountPercent, languageCode);
  const previewItems = cart?.items.slice(0, 3) ?? [];
  const remainingItems = cart ? Math.max(cart.items.length - previewItems.length, 0) : 0;

  return (
    <aside className="product-detail-panel  bg-white rounded-md relative overflow-hidden p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
      />

      <div className="space-y-5 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-first" strokeWidth={1.5} />
              <h2 className="text-lg font-s-bold first-text-color">
                {t('cart.orderSummary') || 'Order Summary'}
              </h2>
            </span>
            {cart && cart.items.length > 0 && (
              <p className="mt-1 text-xs first-text-color-for-paragraph-low">
                {cart.itemCount} {t('cart.shipment') || 'items'}
              </p>
            )}
          </div>
        </div>

        {cart && previewItems.length > 0 && (
          <div className="product-detail-soft-panel space-y-2 p-3">
            {previewItems.map((item) => {
              const imageUrl = getImageUrl(
                item.productImage?.thumbnailPath || item.productImage?.filePath,
              );

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3"
                >
                  <span className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-color-for-layer-on-body p-1.5">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.productName}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Store className="h-5 w-5 first-text-color-svg" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-s-medium first-text-color">
                      {item.productName}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-xs first-text-color-for-paragraph-low">
                      <span>{localizeDigits(item.quantity, languageCode)} x</span>
                      <PriceDisplay
                        amount={item.lineFinalPrice}
                        languageCode={languageCode}
                        currency={item.currencyCode}
                        currencyMode="none"
                      />
                    </span>
                  </span>
                </div>
              );
            })}

            {remainingItems > 0 && (
              <p className="pt-1 text-center text-xs first-text-color-for-paragraph-low">
                +{localizeDigits(remainingItems, languageCode)} {t('cart.shipment') || 'more items'}
              </p>
            )}
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div>
            <SummaryLine
              icon={<ShoppingCart className="h-4 w-4 text-first" strokeWidth={1.5} />}
              label={`${t('cart.priceOfItems') || 'Price of items'} (${cart.itemCount})`}
              value={<PriceDisplay amount={cart.subtotal} languageCode={languageCode} />}
            />

            {cart.totalDiscount > 0 && (
              <SummaryLine
                icon={<Tag className="h-4 w-4 text-green-600 dark:text-green-400" />}
                label={`${t('cart.yourProfit') || 'Your profit from purchase'} (${formattedDiscountPercent}%)`}
                value={
                  <span className="text-green-600 dark:text-green-400">
                    <PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                  </span>
                }
              />
            )}

            {(cart.appliedDeliveryMethodId != null || cart.shippingAmount > 0) && (
              <SummaryLine
                icon={<Truck className="h-4 w-4 text-first" strokeWidth={1.5} />}
                label={t('payment.shippingCost') || 'Shipping cost'}
                value={<PriceDisplay amount={cart.shippingAmount} languageCode={languageCode} />}
              />
            )}

            {cart.taxAmount > 0 && (
              <SummaryLine
                icon={<ReceiptText className="h-4 w-4 text-first" strokeWidth={1.5} />}
                label={t('payment.tax') || 'Tax'}
                value={<PriceDisplay amount={cart.taxAmount} languageCode={languageCode} />}
              />
            )}
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div className="product-detail-soft-panel p-4">
            <SummaryLine
              icon={<CheckCircle className="h-5 w-5 text-first" strokeWidth={1.5} />}
              label={t('cart.cartTotal') || 'Cart Total'}
              value={<PriceDisplay amount={cart.total} languageCode={languageCode} />}
              highlight
            />
          </div>
        )}

        <Button
          onClick={onContinue}
          disabled={continueDisabled}
          className="h-12 w-full gap-2 rounded-lg bg-first text-base font-s-bold text-white hover:bg-first-600"
          size="lg"
        >
          {t('checkout.continue') || 'Continue'}
          <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>

        {cart && cart.items.length > 0 && (
          <p className="text-xs first-text-color-for-paragraph-low">{t('cart.paymentNote')}</p>
        )}
      </div>
    </aside>
  );
}
