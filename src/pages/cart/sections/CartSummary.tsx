import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { toPersianNumbers } from '@/utils/numberFormat';
import { useTranslation } from '@/i18n/useTranslation';
import type { Cart } from '@/utils/cartApi';
import { ShoppingBag, ReceiptText } from 'lucide-react';
import { useLangStore } from '@/stores/languageStore';

interface CartSummaryProps {
  cart: Cart;
  languageCode: string;
  onCheckout?: () => void;
}

export function CartSummary({ cart, languageCode, onCheckout }: CartSummaryProps) {
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const isRTL = dir == 'rtl';
  const isPersian = languageCode === 'fa';

  const discountPercent =
    cart.subtotal > 0 ? Math.round((cart.totalDiscount / cart.subtotal) * 100) : 0;

  return (
    <motion.div
      className=" lg:self-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className=" rounded-lg  bg-color-for-layer-on-body p-6 space-y-2">
        <span className="flex w-full justify-center mb-4 items-center gap-2">
          <span className="first-text-color-svg">
            <ReceiptText strokeWidth={1} className="w-6 h-6" />
          </span>
          <h2 className="text-xl font-s-sbold first-text-color ">{t('cart.cart.orderSummary')}</h2>
        </span>
        <hr className="first-text-color-hr" />
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isPersian ? (
            <>
              <span className="font-f-sbold te first-text-color-for-paragraph">
                <PriceDisplay amount={cart.subtotal} languageCode={languageCode} />
              </span>
              <span className=" font-f-normal first-text-color">
                {t('cart.cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
              </span>
            </>
          ) : (
            <>
              <span className="font-f-sbold first-text-color-for-paragraph">
                {t('cart.cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
              </span>
              <span className="font-f-normal first-text-color">
                <PriceDisplay amount={cart.subtotal} languageCode={languageCode} />
              </span>
            </>
          )}
        </div>
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isPersian ? (
            <>
              <span className="font-f-normal first-text-color">
                <PriceDisplay amount={cart.total} languageCode={languageCode} />
              </span>
              <span className="font-f-sbold first-text-color-for-paragraph">
                {t('cart.cart.cartTotal') || 'Cart Total'}
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground ">
                {t('cart.cart.cartTotal') || 'Cart Total'}
              </span>
              <span className="font-bold text-lg">
                <PriceDisplay amount={cart.total} languageCode={languageCode} />
              </span>
            </>
          )}
        </div>
        {cart.totalDiscount > 0 && (
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isPersian ? (
              <>
                <span className=" text-sm text-green-600 dark:text-green-400">
                  <PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                </span>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t('cart.cart.yourProfit') || 'Your profit from purchase'} (
                  {isPersian ? toPersianNumbers(discountPercent) : discountPercent}%)
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-500 text-sm">
                  {t('cart.cart.yourProfit') || 'Your profit from purchase'} ({discountPercent}%)
                </span>

                <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                  <PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                </span>
              </>
            )}
          </div>
        )}
        <div>
          <Button
            onClick={onCheckout}
            className="w-full font-s-sbold bg-first text-white"
            size="lg"
          >
            {t('cart.cart.confirmAndCompleteOrder') || 'Confirm and Complete Order'}
            <ShoppingBag className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>

        {/* Info Note */}
        <p className="text-xs first-text-color-for-paragraph-low">{t('cart.cart.paymentNote')}</p>
      </div>
    </motion.div>
  );
}
