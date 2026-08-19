import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ReceiptText, ShoppingBag, Tag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { localizeDigits } from '@/utils/numberFormat';
import { useTranslation } from '@/i18n/useTranslation';
import type { Cart } from '@/utils/cartApi';
import { useLangStore } from '@/stores/languageStore';

interface CartSummaryProps {
  cart: Cart;
  languageCode: string;
  onCheckout?: () => void;
}

interface SummaryLineProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

function SummaryLine({ label, value, highlight = false }: SummaryLineProps) {
  return (
    <div className="product-detail-divider flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <span
        className={
          highlight ? 'font-s-bold first-text-color' : 'text-sm first-text-color-for-paragraph'
        }
      >
        {label}
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

export function CartSummary({ cart, languageCode, onCheckout }: CartSummaryProps) {
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';

  const discountPercent =
    cart.subtotal > 0 ? Math.round((cart.totalDiscount / cart.subtotal) * 100) : 0;
  const formattedDiscountPercent = localizeDigits(discountPercent, languageCode);

  return (
    <motion.aside
      className="lg:self-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="product-detail-panel bg-white rounded-md relative overflow-hidden p-4 sm:p-5">
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
              <p className="mt-1 text-xs first-text-color-for-paragraph-low">
                {t('cart.paymentNote')}
              </p>
            </div>

            {cart.totalDiscount > 0 && (
              <span className="rounded-md border border-secound/20 bg-secound/10 px-2.5 py-1 text-xs font-s-bold text-secound">
                {formattedDiscountPercent}% {t('product.discountBadge') || 'Discount'}
              </span>
            )}
          </div>

          <div>
            <SummaryLine
              label={`${t('cart.priceOfItems') || 'Price of items'} (${cart.itemCount})`}
              value={<PriceDisplay amount={cart.subtotal} languageCode={languageCode} />}
            />

            {cart.totalDiscount > 0 && (
              <SummaryLine
                label={`${t('cart.yourProfit') || 'Your profit from purchase'} (${formattedDiscountPercent}%)`}
                value={
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Tag className="h-4 w-4" />
                    <PriceDisplay amount={cart.totalDiscount} languageCode={languageCode} />
                  </span>
                }
              />
            )}

            {(cart.appliedDeliveryMethodId != null || cart.shippingAmount > 0) && (
              <SummaryLine
                label={t('payment.shippingCost') || 'Shipping cost'}
                value={
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-4 w-4 text-first" />
                    <PriceDisplay amount={cart.shippingAmount} languageCode={languageCode} />
                  </span>
                }
              />
            )}
          </div>

          <div className="product-detail-soft-panel p-4">
            <SummaryLine
              label={t('cart.cartTotal') || 'Cart Total'}
              value={<PriceDisplay amount={cart.total} languageCode={languageCode} />}
              highlight
            />
          </div>

          <Button
            onClick={onCheckout}
            className="h-12 w-full gap-2 rounded-lg bg-first text-base font-s-bold text-white hover:bg-first-600"
            size="lg"
          >
            {t('cart.confirmAndCompleteOrder') || 'Confirm and Complete Order'}
            <ShoppingBag className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
