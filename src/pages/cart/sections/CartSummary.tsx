import { motion } from 'framer-motion'
import { formatPrice, toPersianNumbers } from '@/utils/numberFormat'
import { useTranslation } from '@/i18n/useTranslation'
import type { Cart } from '@/utils/cartApi'
import { ShoppingBag } from 'lucide-react'
import { useLangStore } from '@/stores/languageStore'
import { Button } from '@/components/ui/button'

interface CartSummaryProps {
  cart: Cart
  languageCode: string
  onCheckout?: () => void
}

export function CartSummary({ cart, languageCode, onCheckout }: CartSummaryProps) {
  const  dir  = useLangStore(s => s.dir)
  const { t } = useTranslation()
  const isRTL = dir == 'rtl'
  const isPersian = languageCode === 'fa'

  const discountPercent = cart.subtotal > 0
    ? Math.round((cart.totalDiscount / cart.subtotal) * 100)
    : 0

  return (
    <motion.div
      className="lg:sticky lg:top-4 lg:self-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border rounded-lg shadow-sm bg-white dark:bg-gray-800 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">
          {t('cart.orderSummary') || 'Order Summary'}
        </h2>

        {/* Price of Items */}
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isPersian ? (
            <>
              <span className="font-semibold">
                {formatPrice(cart.subtotal, cart.currencySymbol, languageCode, isPersian)}
              </span>
              <span className="text-muted-foreground">
                {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">
                {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
              </span>
              <span className="font-semibold">
                {formatPrice(cart.subtotal, cart.currencySymbol, languageCode, isPersian)}
              </span>
            </>
          )}
        </div>

        {/* Cart Total */}
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          {isPersian ? (
            <>
              <span className="font-bold text-lg">
                {formatPrice(cart.total, cart.currencySymbol, languageCode, isPersian)}
              </span>
              <span className="text-muted-foreground">
                {t('cart.cartTotal') || 'Cart Total'}
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">
                {t('cart.cartTotal') || 'Cart Total'}
              </span>
              <span className="font-bold text-lg">
                {formatPrice(cart.total, cart.currencySymbol, languageCode, isPersian)}
              </span>
            </>
          )}
        </div>

        {/* Your Profit (Discount) */}
        {cart.totalDiscount > 0 && (
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isPersian ? (
              <>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatPrice(cart.totalDiscount, cart.currencySymbol, languageCode, isPersian)}
                </span>
                <span className="text-muted-foreground">
                  {t('cart.yourProfit') || 'Your profit from purchase'} ({isPersian ? toPersianNumbers(discountPercent) : discountPercent}%)
                </span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">
                  {t('cart.yourProfit') || 'Your profit from purchase'} ({isPersian ? toPersianNumbers(discountPercent) : discountPercent}%)
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatPrice(cart.totalDiscount, cart.currencySymbol, languageCode, isPersian)}
                </span>
              </>
            )}
          </div>
        )}

        <div className="pt-4 border-t dark:border-gray-700">
          <Button
            onClick={onCheckout}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            <ShoppingBag className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('cart.confirmAndCompleteOrder') || 'Confirm and Complete Order'}
          </Button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {t('cart.paymentNote') || 'The cost of this order has not yet been paid, and in case of out of stock, items will be removed from the cart.'}
        </p>
      </div>
    </motion.div>
  )
}


