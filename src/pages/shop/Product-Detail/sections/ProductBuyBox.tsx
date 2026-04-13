import { motion } from "framer-motion";
import {
  ShoppingCart,
  Check,
  X,
  Shield,
  Truck,
  Minus,
  Plus,
  AlertCircle,
  Store,
  Award,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import { formatPrice, toPersianNumbers } from "@/utils/numberFormat";
import type {
  ProductDetail,
  ProductPrice,
  ProductInventory,
} from "@/utils/shopApi";
import useAddToCart from "@/hooks/cart/useAddToCart";
import useRemoveCartItem from "@/hooks/cart/useRemoveCartItem";
import useDebouncedCartUpdate from "@/hooks/cart/useDebouncedCartUpdate";
import { useEffect, useRef, useState } from "react";
import useCartStore from "@/stores/cartStore";
import { useLangStore } from "@/stores/languageStore";

interface ProductBuyBoxProps {
  product: ProductDetail | null;
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
}: ProductBuyBoxProps) {
  const { t } = useTranslation();
  const dir = useLangStore((s) => s.dir);
  const isRTL = dir == 'rtl';
  const isPersian = languageCode === "fa";

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
    : Math.max(
        currentInventory?.availableQuantity ?? Number.POSITIVE_INFINITY,
        0
      );
  const canIncreaseQuantity = cartItem
    ? localQuantity < maxAvailableQuantity
    : false;

  const handleQuantityUpdate = (nextQuantity: number) => {
    if (!cartItem) return;
    const safeQuantity = Math.max(
      1,
      Math.min(nextQuantity, maxAvailableQuantity)
    );

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

  return (
    <div className={cn("lg:sticky lg:top-4 lg:self-start")}>
      <motion.div
        className="border rounded-lg shadow-sm bg-background overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Seller Section - Gray Background */}
        {product.vendorName && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t("product.seller") || "Seller"}:
              </span>
              <span className="text-sm font-semibold">
                {product.vendorName}
              </span>
              <Award className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Price Section */}
          {currentPrice && (
            <div className={cn("space-y-2", isRTL && "text-right")}>
              {currentPrice.isOnSale && currentPrice.salePrice ? (
                <div className="relative">
                  {/* Modern Discount Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-2",
                      isRTL ? "justify-end" : "justify-start"
                    )}
                  >
                    <motion.div
                      className={cn(
                        "relative inline-flex items-center justify-center",
                        "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
                        "text-white font-bold shadow-lg",
                        "px-3 py-1.5 rounded-lg",
                        "border-2 border-white dark:border-gray-800",
                        "transform transition-all duration-300",
                        "hover:scale-105 hover:shadow-xl"
                      )}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      {/* Decorative corner accent */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-gray-800 rounded-full opacity-50" />
                      <span className="text-sm leading-none">
                        {isPersian
                          ? toPersianNumbers(
                              Math.round(
                                ((currentPrice.price - currentPrice.salePrice) /
                                  currentPrice.price) *
                                  100
                              )
                            )
                          : Math.round(
                              ((currentPrice.price - currentPrice.salePrice) /
                                currentPrice.price) *
                                100
                            )}
                        %
                      </span>
                    </motion.div>
                  </div>

                  {/* Price Display */}
                  <div
                    className={cn("flex flex-col gap-1", isRTL && "items-end")}
                  >
                    <span
                      className={cn(
                        "text-lg text-muted-foreground line-through",
                        isRTL && "text-left"
                      )}
                    >
                      {formatPrice(
                        currentPrice.price,
                        currentPrice.currencySymbol,
                        languageCode,
                        isPersian // Put symbol after for Persian
                      )}
                    </span>
                    <motion.span
                      className={cn(
                        "text-3xl font-bold text-primary",
                        isRTL && "text-right"
                      )}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {formatPrice(
                        currentPrice.salePrice,
                        currentPrice.currencySymbol,
                        languageCode,
                        isPersian // Put symbol after for Persian
                      )}
                    </motion.span>
                  </div>
                </div>
              ) : (
                <motion.span
                  className={cn(
                    "text-3xl font-bold block",
                    isRTL && "text-right"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {formatPrice(
                    currentPrice.price,
                    currentPrice.currencySymbol,
                    languageCode,
                    isPersian // Put symbol after for Persian
                  )}
                </motion.span>
              )}
            </div>
          )}

          {/* Stock Warning */}
          {currentInventory &&
            currentInventory.availableQuantity > 0 &&
            currentInventory.availableQuantity <= 5 && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("product.lowStock") || "Only"}{" "}
                  {currentInventory.availableQuantity}{" "}
                  {t("product.itemsLeft") || "items left in stock"}
                </span>
              </div>
            )}

          {/* Variants */}
          {activeVariants.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("product.selectVariant") || "Select Variant"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeVariants.map((variant) => (
                  <motion.button
                    key={variant.id}
                    onClick={() => onVariantChange(variant.id)}
                    className={cn(
                      "px-3 py-1.5 border rounded-lg transition-all text-left",
                      selectedVariant === variant.id
                        ? "border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/20 dark:ring-primary/40"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary/70"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-xs font-medium">{variant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {variant.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          {isVariantMissing && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {t("product.selectVariant") || "Select Variant"}
            </p>
          )}

          {/* Quantity Selector */}
          {/* Quantity / Add-to-Cart */}
          {cartItem ? (
            // ✅ ITEM IS IN CART → SHOW QUANTITY CONTROL
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center border rounded-lg bg-white dark:bg-gray-700 w-28",
                  isRTL && "flex-row-reverse"
                )}
              >
                {localQuantity === 1 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCartItem.mutate(cartItem!.id)}
                    disabled={removeCartItem.isPending || isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={isPending}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}

                <span className="px-4 py-2 text-center font-medium">
                  {isPersian ? toPersianNumbers(localQuantity) : localQuantity}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncrease}
                  disabled={isPending || !canIncreaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={!isInStock || isVariantMissing || addToCart.isPending || removeCartItem.isPending}
                onClick={() => {
                  addToCart.mutate({
                    productId: product.id,
                    variantId: selectedVariant ?? undefined,
                    quantity: 1,
                  });
                }}
              >
                <ShoppingCart
                  className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")}
                />
                {isVariantMissing
                  ? t("product.selectVariant") || "Select Variant"
                  : t("product.addToCart") || "Add to Cart"}
              </Button>
            </motion.div>
          )}

          {/* Warranty & Shipping Info */}
          <div className="space-y-2 pt-3 border-t dark:border-gray-700">
            {product.hasWarranty && product.warrantyType && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>{product.warrantyType}</span>
              </div>
            )}
            {product.postalMethod && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>
                  {t("product.shippingMethod") || "Shipping method"}:{" "}
                  {product.postalMethod}
                </span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
            {isInStock ? (
              <>
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {t("product.inStock") || "In Stock"}
                </span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {t("product.outOfStock") || "Out of Stock"}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
