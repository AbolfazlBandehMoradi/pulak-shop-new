import { ArrowRight, CheckCircle, ReceiptText, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { toPersianNumbers } from '@/utils/numberFormat';
import type { Cart } from '@/utils/cartApi';

type TranslateFn = (key: string) => string | undefined;

interface CheckoutSummaryProps {
  cart: Cart | null;
  languageCode: string;
  isRTL: boolean;
  t: TranslateFn;
  onContinue: () => void;
}

export function CheckoutSummary({
  cart,
  languageCode,
  isRTL,
  t,
  onContinue,
}: CheckoutSummaryProps) {
  const discountPercent =
    cart && cart.subtotal > 0 ? Math.round((cart.totalDiscount / cart.subtotal) * 100) : 0;
  const isPersian = languageCode === 'fa';

  return (
    <div className="rounded-lg bg-color-for-layer-on-body p-6 space-y-2">
      {cart && cart.items.length > 0 && (
        <>
          <span className="flex w-full justify-center items-center gap-2">
            <span className="first-text-color-svg">
              <ReceiptText strokeWidth={1} className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-s-sbold first-text-color">{t('cart.orderSummary')}</h2>
          </span>

          <hr className="first-text-color-hr my-2" />

          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isPersian ? (
              <>
                <span className="font-f-sbold te first-text-color-for-paragraph">
                  {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
                </span>
                <span className="font-f-normal first-text-color">
                  <PriceDisplay amount={cart.subtotal} languageCode={languageCode} />
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
                </span>
                <span className="font-semibold">
                  <PriceDisplay amount={cart.subtotal} languageCode={languageCode} />
                </span>
              </>
            )}
          </div>

          {cart.totalDiscount > 0 && (
            <div
              className={`flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              {isPersian ? (
                <>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    <PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                  </span>
                  <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('cart.yourProfit') || 'Your profit from purchase'} (
                    {toPersianNumbers(discountPercent)}%)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('cart.yourProfit') || 'Your profit from purchase'} ({discountPercent}%)
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    -<PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                  </span>
                </>
              )}
            </div>
          )}

          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isPersian ? (
              <>
                <span className="first-text-color font-f-bold">
                  {t('cart.cartTotal') || 'Cart Total'}
                </span>
                <span className="font-bold text-lg text-red-600 dark:text-red-400">
                  <PriceDisplay amount={cart.total} languageCode={languageCode} />
                </span>
              </>
            ) : (
              <>
                <span className="text-foreground font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  {t('cart.cartTotal') || 'Cart Total'}
                </span>
                <span className="font-bold text-lg text-red-600 dark:text-red-400">
                  <PriceDisplay amount={cart.total} languageCode={languageCode} />
                </span>
              </>
            )}
          </div>
        </>
      )}

      <div>
        <Button onClick={onContinue} className="w-full font-s-sbold bg-first text-white" size="lg">
          <span className="flex items-center justify-center gap-2">
            {t('checkout.continue') || 'Continue'}
            <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </span>
        </Button>
      </div>

      {cart && cart.items.length > 0 && (
        <p className="text-xs first-text-color-for-paragraph-low">{t('cart.paymentNote')}</p>
      )}
    </div>
  );
}
