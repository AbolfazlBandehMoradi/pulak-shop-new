import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Shield,
  Truck,
  Minus,
  Plus,
  AlertCircle,
  Store,
  Award,
  Trash2,
  Star,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/IconButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n/useTranslation';
import { toPersianNumbers } from '@/utils/numberFormat';
import type { ProductDetail, ProductPrice, ProductInventory } from '@/utils/shopApi';
import useAddToCart from '@/hooks/cart/useAddToCart';
import useRemoveCartItem from '@/hooks/cart/useRemoveCartItem';
import useDebouncedCartUpdate from '@/hooks/cart/useDebouncedCartUpdate';
import { useEffect, useRef, useState } from 'react';
import useCartStore from '@/stores/cartStore';
import { useLangStore } from '@/stores/languageStore';
import { Link } from 'react-router-dom';

interface ProductBuyBoxProps {
  product?: ProductDetail | null;
  cartItem:
    | {
        id: number;
        quantity: number;
      }
    | undefined;
  loading?: boolean;
  selectedVariant: number | null;
  onVariantChange: (variantId: number | null) => void;
  showAnimationOnAdd: (arg: boolean) => void;
  currentPrice: ProductPrice | null;
  currentInventory: ProductInventory | null;
  isInStock: boolean;
  languageCode: string;
  className?: string;
  children?: React.ReactNode; // <--- این خط رو اضافه کن
  isCompact?: boolean;
}

export function ProductBuyBox({
  product,
  loading,
  selectedVariant,
  onVariantChange,
  currentPrice,
  currentInventory,
  cartItem,
  isInStock,
  showAnimationOnAdd,
  languageCode,
  className,
  isCompact = false,
  children,
}: ProductBuyBoxProps) {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);
  const isRTL = dir == 'rtl';
  const isPersian = languageCode === 'fa';

  const [localQuantity, setLocalQuantity] = useState(cartItem?.quantity || 1);
  const serverQuantityRef = useRef<number | null>(null);
  const { updateItemQuantityLocal } = useCartStore();

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
      serverQuantityRef.current = cartItem.quantity;
    }
  }, [cartItem?.id, cartItem?.quantity]);
  const addToCart = useAddToCart({ onSuccess: () => showAnimationOnAdd(true) });
  const { updateCartDebounced, isPending } = useDebouncedCartUpdate();
  const removeCartItem = useRemoveCartItem();
  const activeVariants = product?.variants?.filter((v) => v.isActive) || [];
  const hasSelectableVariants = activeVariants.length > 0;
  const isVariantMissing = hasSelectableVariants && selectedVariant === null;
  const maxAvailableQuantity = currentInventory?.allowBackorders
    ? Number.POSITIVE_INFINITY
    : Math.max(currentInventory?.availableQuantity ?? Number.POSITIVE_INFINITY, 0);
  const canIncreaseQuantity = cartItem ? localQuantity < maxAvailableQuantity : false;

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
  if (loading || !product) {
    return (
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="border rounded-lg shadow-sm bg-background p-6 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  console.log(product);
  return (
    <div className={cn('lg:sticky lg:top-24 lg:self-start')}>
      <motion.div
        className={cn('bg-color-for-layer-sec p-6 rounded-xl relative', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isCompact && (
          <>
            <div className="space-y-6 bg-color-for-layer-on-body p-4 rounded-lg">
              {product.vendorName && (
                <div className="flex items-center justify-between ">
                  <span className="flex items-center gap-1 ">
                    <Store
                      className="h-4 w-4 text-secound dark:text-secound-600 "
                      strokeWidth={1}
                    />
                    <span className="text-sm first-text-color-for-paragraph ">
                      {t('product.seller') || 'Seller'}
                    </span>
                  </span>
                  <span className="text-sm text-secound dark:text-secound-600 ">
                    {product.vendorName}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between ">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-4 w-4 text-secound dark:text-secound-600 " strokeWidth={1} />
                  <span className="text-sm first-text-color-for-paragraph ">
                    {t('product.rating') || 'Seller'}
                  </span>
                </span>
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        product.averageRating && i < Math.round(product.averageRating)
                          ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                          : 'text-gray-300 dark:text-gray-600',
                      )}
                    />
                  ))}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between ">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle
                      className="h-4 w-4 text-secound dark:text-secound-600"
                      strokeWidth={1}
                    />
                    <span className="text-sm first-text-color-for-paragraph ">
                      {t('product.reviews')}
                    </span>
                  </span>
                  <span className="text-sm text-secound dark:text-secound-600">
                    {product.reviewCount && product.reviewCount > 0
                      ? `${product.reviewCount} ${t('product.reviews') || 'reviews'}`
                      : '0 نظر'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between ">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-4 w-4 text-secound dark:text-secound-600" strokeWidth={1} />
                    <span className="text-sm first-text-color-for-paragraph ">
                      {t('product.brand')}
                    </span>
                  </span>
                  {product.brand && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-secound dark:text-secound-600 text-sm">
                        {product.brand?.name || '-'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between ">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Shield
                      className="h-4 w-4 text-secound dark:text-secound-600"
                      strokeWidth={1}
                    />
                    <span className="text-sm first-text-color-for-paragraph ">
                      {t('product.warranty')}
                    </span>
                  </span>
                  {product.hasWarranty && product.warrantyType && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-secound dark:text-secound-600 text-sm">
                        {product.warrantyType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between ">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="h-4 w-4 text-secound dark:text-secound-600" strokeWidth={1} />
                    <span className="text-sm first-text-color-for-paragraph ">
                      {t('product.shippingMethod')}
                    </span>
                  </span>
                  {product.postalMethod && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-secound dark:text-secound-600 text-sm">
                        {product.postalMethod}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {currentInventory &&
                currentInventory.availableQuantity > 0 &&
                currentInventory.availableQuantity <= 5 && (
                  <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-100 bg-red-100 dark:bg-red-500 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs ">
                      {t('product.lowStock') || 'Only'}{' '}
                      <span className="font-f-bold">{currentInventory.availableQuantity} </span>
                      {t('product.itemsLeft') || 'items left in stock'}
                    </span>
                  </div>
                )}
              {(!currentInventory || currentInventory.availableQuantity === 0) && (
                <div className="flex items-center justify-center gap-2 text-white bg-red-500 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {t('product.outOfStock') || 'This product is out of stock'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {currentInventory && currentInventory.availableQuantity > 0 && (
          <div>
            {activeVariants.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t('product.selectVariant') || 'Select Variant'}
                </label>
                <div className=" grid-cols-12 sm:grid-cols-3 grid flex-wrap  gap-2">
                  {activeVariants.map((variant) => (
                    <motion.button
                      key={variant.id}
                      onClick={() => onVariantChange(variant.id)}
                      className={cn(
                        ' bg-color-for-layer-on-body p-2 rounded-md transition-all text-start  ',
                        selectedVariant === variant.id ? 'border-3 border-first ' : '',
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-xs font-medium">{variant.name}</div>
                      <div className="text-xs text-muted-foreground">{variant.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {currentPrice && (
              <div className={cn('', isRTL && 'text-right')}>
                {currentPrice.isOnSale && currentPrice.salePrice ? (
                  <div>
                    <div
                      className={cn('justify-between flex my-2 flex-wrap', isRTL && 'items-end')}
                    >
                      <span
                        className={cn(
                          'text-xl first-text-color-for-paragraph-low relative font-s-sbold',
                          isRTL && 'text-left',
                        )}
                      >
                        <PriceDisplay amount={currentPrice.price} languageCode={languageCode} />
                        <span className="w-full bg-red-500 opacity-50 absolute inset-0 top-1/2 translate-y-1/2 rotate-12 h-0.5"></span>
                      </span>
                      <span className={cn('flex items-center', isRTL && '')}>
                        <span className="text-2xl first-text-color relative font-s-sbold">
                          <PriceDisplay amount={currentPrice.salePrice} languageCode={languageCode} />
                        </span>
                      </span>
                    </div>
                    <div>
                      {!isCompact && (
                        <motion.div
                          className={cn(
                            'absolute -top-4 -right-4 flex justify-center items-center text-white rounded-sm w-7 h-7 bg-color-for-red ',
                          )}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            delay: 0.2,
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                          }}
                        >
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-color-for-red rounded-full soft-blink" />
                          <span className="text-sm leading-none">
                            {isPersian
                              ? toPersianNumbers(
                                  Math.round(
                                    ((currentPrice.price - currentPrice.salePrice) /
                                      currentPrice.price) *
                                      100,
                                  ),
                                )
                              : Math.round(
                                  ((currentPrice.price - currentPrice.salePrice) /
                                    currentPrice.price) *
                                    100,
                                )}
                            %
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className={cn('flex items-center my-2', isRTL && '')}>
                    <span className="text-2xl first-text-color relative font-s-sbold">
                      <PriceDisplay amount={currentPrice.price} languageCode={languageCode} />
                    </span>
                  </span>
                )}
              </div>
            )}
            {cartItem ? (
              <div className="flex justify-between flex-wrap">
                <div
                  className={cn(
                    'flex items-center py-2 rounded-lg bg-secound w-48/96',
                    isRTL && 'flex-row-reverse',
                  )}
                >
                  {localQuantity === 1 ? (
                    <div className="w-36/96">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCartItem.mutate(cartItem!.id)}
                        disabled={removeCartItem.isPending || isPending}
                        className="text-white w-full "
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-36/96">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full text-white"
                        onClick={handleDecrease}
                        disabled={isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="w-36/96 flex items-center justify-center">
                    <span className="font-f-bold text-white">
                      {isPersian ? toPersianNumbers(localQuantity) : localQuantity}
                    </span>
                  </div>
                  <div className="w-36/96">
                    <Button
                      variant="ghost"
                      className="w-full text-white"
                      size="icon"
                      onClick={handleIncrease}
                      disabled={isPending || !canIncreaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Link
                  to={'/cart'}
                  className={cn(
                    'flex items-end flex-col justify-center gap-1 w-48/96',
                    isRTL && ' ',
                  )}
                >
                  <span className="flex gap-1 text-xs">
                    <span>{localQuantity}</span>
                    <span>{t('product.number')}</span>
                    <span>{t('product.Incart')}</span>
                  </span>
                  <span className="flex text-sm text-first  ">{t('product.view')}</span>
                </Link>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full text-white font-s-bold text-lg gap-2 bg-secound"
                  disabled={
                    !isInStock ||
                    isVariantMissing ||
                    addToCart.isPending ||
                    removeCartItem.isPending
                  }
                  onClick={() => {
                    addToCart.mutate({
                      productId: product.id,
                      variantId: selectedVariant ?? undefined,
                      quantity: 1,
                    });
                  }}
                >
                  {isVariantMissing
                    ? t('product.selectVariant') || 'Select Variant'
                    : t('product.addToCart') || 'Add to Cart'}
                  <ShoppingCart className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
                </Button>
              </motion.div>
            )}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
