import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import { Button as IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslation } from '@/i18n/useTranslation';
import { toPersianNumbers } from '@/utils/numberFormat';
import { cn } from '@/utils/cn';
import useAddToCart from '@/hooks/cart/useAddToCart';
import useRemoveCartItem from '@/hooks/cart/useRemoveCartItem';
import useDebouncedCartUpdate from '@/hooks/cart/useDebouncedCartUpdate';
import useCartStore from '@/stores/cartStore';
import type { ProductDetail, ProductPrice, ProductInventory } from '@/utils/shopApi';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';

interface MobileStickyBarProps {
  product: ProductDetail | null;
  cartItem: { id: number; quantity: number } | undefined;
  currentPrice: ProductPrice | null;
  currentInventory: ProductInventory | null;
  isInStock: boolean;
  languageCode?: string;
  showAnimationOnAdd: (arg: boolean) => void;
  selectedVariant: number | null;
  setSelectedVariant: (variantId: number | null) => void;
}

export function MobileStickyBar({
  product,
  cartItem,
  currentPrice,
  currentInventory,
  isInStock,
  languageCode,
  showAnimationOnAdd,
  selectedVariant,
  setSelectedVariant,
}: MobileStickyBarProps) {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const dir = useLangStore((s) => s.dir);
  const isRTL = dir === 'rtl';
  const isPersian = languageCode === 'fa';

  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 1);
  const serverQuantityRef = useRef<number | null>(null);
  const { updateItemQuantityLocal } = useCartStore();

  const addToCart = useAddToCart({ onSuccess: () => showAnimationOnAdd(true) });
  const { updateCartDebounced, isPending } = useDebouncedCartUpdate();
  const removeCartItem = useRemoveCartItem();
  const activeVariants = product?.variants?.filter((variant) => variant.isActive) ?? [];
  const hasSelectableVariants = activeVariants.length > 0;
  const isVariantMissing = hasSelectableVariants && selectedVariant === null;
  const maxAvailableQuantity = currentInventory?.allowBackorders
    ? Number.POSITIVE_INFINITY
    : Math.max(currentInventory?.availableQuantity ?? Number.POSITIVE_INFINITY, 0);
  const canIncreaseQuantity = cartItem ? localQuantity < maxAvailableQuantity : false;
  const hasLowStockWarning = Boolean(
    currentInventory &&
      currentInventory.availableQuantity <= 5 &&
      currentInventory.availableQuantity > 0,
  );

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
      serverQuantityRef.current = cartItem.quantity;
    }
  }, [cartItem?.id, cartItem?.quantity]);

  const handleQuantityUpdate = (nextQuantity: number) => {
    if (!cartItem) return;
    const safeQuantity = Math.max(1, Math.min(nextQuantity, maxAvailableQuantity));

    updateItemQuantityLocal(cartItem.id, safeQuantity);
    updateCartDebounced(cartItem.id, safeQuantity, () => {
      const fallbackQuantity = serverQuantityRef.current ?? 1;
      setLocalQuantity(fallbackQuantity);
      updateItemQuantityLocal(cartItem.id, fallbackQuantity);
    });
  };

  const handleDecrease = () => {
    if (!cartItem || isPending) return;

    setLocalQuantity((previousQuantity) => {
      const nextQuantity = Math.max(previousQuantity - 1, 1);
      handleQuantityUpdate(nextQuantity);
      return nextQuantity;
    });
  };

  const handleIncrease = () => {
    if (!cartItem || isPending) return;

    setLocalQuantity((previousQuantity) => {
      if (previousQuantity >= maxAvailableQuantity) {
        return previousQuantity;
      }
      const nextQuantity = previousQuantity + 1;
      handleQuantityUpdate(nextQuantity);
      return nextQuantity;
    });
  };

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-[30] border-t border-gray-200/70 bg-color-for-layer-on-body px-4 pt-3 shadow-dark-sm lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {/* Variant Selector for Mobile */}
        {product && product.variants && activeVariants.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeVariants.map((variant) => (
              <Button
                key={variant.id}
                size="sm"
                variant={selectedVariant === variant.id ? 'primary' : 'outline'}
                onClick={() => setSelectedVariant(variant.id)}
                className="shrink-0 rounded-xl px-3 text-xs"
              >
                {variant.name}
              </Button>
            ))}
          </div>
        )}
        {isVariantMissing && (
          <p className="rounded-xl bg-orange-100 px-3 py-2 text-xs text-orange-600 dark:bg-orange-900/25 dark:text-orange-300">
            {t('product.selectVariant') || 'Select Variant'}
          </p>
        )}

        <div className="rounded-2xl border border-gray-200/70 bg-color-for-layer-sec p-3">
          {hasLowStockWarning && currentInventory && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-orange-100 p-2 text-sm text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
              <AlertCircle className="h-4 w-4" />
              {t('product.lowStock') || 'Only'}{' '}
              {isPersian
                ? toPersianNumbers(currentInventory.availableQuantity)
                : currentInventory.availableQuantity}{' '}
              {t('product.itemsLeft') || 'items left'}
            </div>
          )}

          {!isInStock && (
            <div className="mb-2 rounded-xl bg-red-100 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {t('product.outOfStock') || 'This product is out of stock'}
            </div>
          )}

          {/* Price + Add to Cart / Quantity Control */}
          {currentPrice && (
            <div className="flex flex-col gap-3">
              <div className={cn('flex flex-col', isRTL && 'items-end')}>
                {currentPrice.isOnSale && currentPrice.salePrice ? (
                  <>
                    <span className="text-xs line-through first-text-color-for-paragraph-low">
                      <PriceDisplay amount={currentPrice.price} languageCode={languageCode} />
                    </span>
                    <span className="text-lg font-s-sbold text-first">
                      <PriceDisplay amount={currentPrice.salePrice} languageCode={languageCode} />
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-s-sbold first-text-color">
                    <PriceDisplay amount={currentPrice.price} languageCode={languageCode} />
                  </span>
                )}
              </div>

              {/* Quantity / Add-to-Cart */}
              {cartItem ? (
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <div className="flex flex-1 items-center rounded-xl border border-gray-300/60 bg-color-for-layer-on-body">
                    {localQuantity === 1 ? (
                      <IconButton
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCartItem.mutate(cartItem.id)}
                        disabled={removeCartItem.isPending || isPending}
                        className="first-text-color-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    ) : (
                      <IconButton
                        variant="ghost"
                        size="icon"
                        onClick={handleDecrease}
                        disabled={isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </IconButton>
                    )}

                    <span className="flex-1 px-3 text-center font-s-sbold first-text-color">
                      {isPersian ? toPersianNumbers(localQuantity) : localQuantity}
                    </span>

                    <IconButton
                      variant="ghost"
                      size="icon"
                      onClick={handleIncrease}
                      disabled={isPending || !canIncreaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </IconButton>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl bg-color-for-layer-on-body px-3 text-xs first-text-color"
                    onClick={() => navigate('/cart')}
                  >
                    {t('cart.viewCart') || 'View Cart'}
                  </Button>
                </div>
              ) : (
                <Button
                  size="md"
                  className="w-full bg-secound text-white hover:bg-secound-600"
                  disabled={!isInStock || isVariantMissing || addToCart.isPending}
                  onClick={() =>
                    addToCart.mutate({
                      productId: product!.id,
                      variantId: selectedVariant ?? undefined,
                      quantity: 1,
                    })
                  }
                >
                  <ShoppingCart className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
                  {isVariantMissing
                    ? t('product.selectVariant') || 'Select Variant'
                    : t('product.addToCart') || 'Add to Cart'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
