import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { CartItem } from './sections/CartItem';
import { CartSummary } from './sections/CartSummary';
import useCartStore from '@/stores/cartStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';
import { useLangStore } from '@/stores/languageStore';

const Cart = () => {
  const navigate = useLocalizedNavigate();
  const { cart } = useCartStore();
  const { t } = useTranslation();
  const currentLanguage = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);
  const isRTL = dir === 'rtl';
  const effectiveLangCode = currentLanguage || 'fa';

  return (
    <main className="mx-auto mt-20 lg:mt-8 px-4 sm:container">
      <CheckoutStepper currentStep={1} />
      <div className="mb-6">
        <div className="flex items-center justify-between  gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className=" font-s-bold first-text-color text-xl ">
                {t('cart.yourShoppingCart') || 'Your Shopping Cart'}
              </h1>
              {cart && cart.items.length > 0 && (
                <p className="  first-text-color   flex items-center gap-1 mt-1">
                  <Package className="h-4 w-4" />
                  <span>{cart.items.length} {t('cart.shipment') || 'shipment'}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/products`)}
            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.back') || 'Back'}
          </Button>
        </div>
      </div>

      {cart && cart.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-first/15 bg-color-for-layer-on-body p-4 shadow-dark-sm"
        >
          <div
            className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}
          >
            <div className={isRTL ? 'sm:text-right' : ''}>
              <p className="text-sm first-text-color-for-paragraph">
                {t('cart.cartTotal') || 'Cart Total'}
              </p>
              <p className="text-2xl font-s-bold text-first">
                <PriceDisplay amount={cart.total} languageCode={effectiveLangCode} />
              </p>
            </div>
            <Button
              onClick={() => navigate('/checkout')}
              className="bg-first text-white hover:bg-first-600"
              size="lg"
            >
              {t('checkout.continue') || 'Continue'}
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Button>
          </div>
        </motion.div>
      )}

      {!cart || cart.items.length === 0 ? (
        // Empty cart
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full mb-2">
              <ShoppingCart className="h-24 w-24 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t('cart.emptyCart') || 'Your cart is empty'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('cart.emptyCartMessage') || 'Add some products to your cart to get started.'}
            </p>
            <Button
              onClick={() => navigate(`/products`)}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
              size="lg"
            >
              <ShoppingBag className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('cart.continueShopping') || 'Continue Shopping'}
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Button>
          </div>
        </motion.div>
      ) : (
        // Cart with items
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Column - Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CartItem item={item} />
              </motion.div>
            ))}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <CartSummary
                cart={cart}
                languageCode={effectiveLangCode}
                onCheckout={() => navigate('/checkout')}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </main>
  );
};

export default Cart;
