import { motion } from "framer-motion";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import type { Cart } from "@/utils/cartApi";
import { Button } from "@/components/ui/Button";
import { CartItem } from "./sections/CartItem";
import { CartSummary } from "./sections/CartSummary";
import useCartStore from "@/stores/cartStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";

const Cart = () => {
  const navigate = useLocalizedNavigate();
  const {cart} = useCartStore();
  const {t} = useTranslation()

  return (
    <main className="flex-1 container mx-auto px-4 py-6">
      {/* Shopping Cart Steps */}
      <div className="mt-8 mb-8">
        <style>{`
            @keyframes smooth-pulse {
              0%, 100% {
                opacity: 0.4;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.15);
              }
            }
            .smooth-pulse {
              animation: smooth-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* Step 1: Cart - Active */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-400 smooth-pulse"></div>
              <div className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {t("cart.yourShoppingCart") || "Cart"}
              </span>
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-gray-200 dark:from-blue-500 dark:to-gray-700 w-0"></div>
          </div>

          {/* Step 2: Checkout */}
          <div className="flex itemscenter gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-muted-foreground">
                {t("checkout.title") || "Checkout"}
              </span>
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {/* Step 3: Payment */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-muted-foreground">
                پرداخت
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {t("cart.yourShoppingCart") || "Your Shopping Cart"}
              </h1>
              {cart && cart.items.length > 0 && (
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4" />
                  <span>
                    {cart.items.length} {t("cart.shipment") || "shipment"}
                    {cart.items.length > 1 ? "s" : ""}
                  </span>
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/products`)}
            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            <ArrowLeft className={`h-4 w-4 ${true ? "ml-2" : "mr-2"}`} />
            {t("common.back") || "Back"}
          </Button>
        </div>
      </div>

      { !cart || cart.items.length === 0 ? (
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
              {t("cart.emptyCart") || "Your cart is empty"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("cart.emptyCartMessage") ||
                "Add some products to your cart to get started."}
            </p>
            <Button
              onClick={() => navigate(`/products`)}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
              size="lg"
            >
              <ShoppingBag className={`h-5 w-5 ${true ? "ml-2" : "mr-2"}`} />
              {t("cart.continueShopping") || "Continue Shopping"}
              <ArrowRight
                className={`h-5 w-5 ${true ? "mr-2 rotate-180" : "ml-2"}`}
              />
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
                <CartItem
                  item={item}
                />
              </motion.div>
            ))}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CartSummary
                cart={cart}
                languageCode={'fa'}
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
