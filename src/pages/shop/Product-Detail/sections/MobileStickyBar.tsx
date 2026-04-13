import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle } from "lucide-react";
import { Button as IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/useTranslation";
import { formatPrice, toPersianNumbers } from "@/utils/numberFormat";
import { cn } from "@/utils/cn";
import useAddToCart from "@/hooks/cart/useAddToCart";
import useRemoveCartItem from "@/hooks/cart/useRemoveCartItem";
import useDebouncedCartUpdate from "@/hooks/cart/useDebouncedCartUpdate";
import useCartStore from "@/stores/cartStore";
import type {
  ProductDetail,
  ProductPrice,
  ProductInventory,
} from "@/utils/shopApi";
import { useLangStore } from "@/stores/languageStore";

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
  const dir = useLangStore((s) => s.dir);
  const isRTL = dir == "rtl";
  const isPersian = languageCode === "fa";

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
    : Math.max(
        currentInventory?.availableQuantity ?? Number.POSITIVE_INFINITY,
        0
      );
  const canIncreaseQuantity = cartItem
    ? localQuantity < maxAvailableQuantity
    : false;

  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity);
      serverQuantityRef.current = cartItem.quantity;
    }
  }, [cartItem?.id, cartItem?.quantity]);

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

  return (
    <motion.div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-background dark:bg-gray-900 border-t dark:border-gray-800 shadow-lg z-40 p-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Variant Selector for Mobile */}
      {product && product.variants && activeVariants.length > 0 && (
        <div className="lg:hidden flex flex-wrap gap-2 mb-4 px-4">
          {activeVariants.map((variant) => (
            <Button
              key={variant.id}
              size="sm"
              variant={selectedVariant === variant.id ? "primary" : "outline"}
              onClick={() => setSelectedVariant(variant.id)}
              className="text-xs px-2 py-1"
            >
              {variant.name}
            </Button>
          ))}
        </div>
      )}
      {isVariantMissing && (
        <p className="text-xs text-orange-600 dark:text-orange-400">
          {t("product.selectVariant") || "Select Variant"}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {/* Low Stock Warning */}
        {currentInventory &&
          currentInventory.availableQuantity <= 5 &&
          currentInventory.availableQuantity > 0 && (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              {t("product.lowStock") || "Only"}{" "}
              {isPersian
                ? toPersianNumbers(currentInventory.availableQuantity)
                : currentInventory.availableQuantity}{" "}
              {t("product.itemsLeft") || "items left"}
            </div>
          )}

        {/* Price + Add to Cart / Quantity Control */}
        {currentPrice && (
          <div className="flex justify-between items-center">
            {/* Price */}
            <div className={cn("flex flex-col", isRTL && "items-end")}>
              {currentPrice.isOnSale && currentPrice.salePrice ? (
                <>
                  <span className="text-sm line-through text-muted-foreground">
                    {formatPrice(
                      currentPrice.price,
                      currentPrice.currencySymbol,
                      languageCode,
                      isPersian
                    )}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(
                      currentPrice.salePrice,
                      currentPrice.currencySymbol,
                      languageCode,
                      isPersian
                    )}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold">
                  {formatPrice(
                    currentPrice.price,
                    currentPrice.currencySymbol,
                    languageCode,
                    isPersian
                  )}
                </span>
              )}
            </div>

            {/* Quantity / Add-to-Cart */}
            {cartItem ? (
              <div className="flex items-center border rounded-lg bg-white dark:bg-gray-700">
                {localQuantity === 1 ? (
                  <IconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCartItem.mutate(cartItem!.id)}
                    disabled={removeCartItem.isPending || isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
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

                <span className="px-3 text-center">
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
            ) : (
              <Button
                size="md"
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                disabled={!isInStock || isVariantMissing || addToCart.isPending}
                onClick={() =>
                  addToCart.mutate({
                    productId: product!.id,
                    variantId: selectedVariant ?? undefined,
                    quantity: 1,
                  })
                }
              >
                <ShoppingCart className={cn("h-5 w-5 mr-2")} />
                {isVariantMissing
                  ? t("product.selectVariant") || "Select Variant"
                  : t("product.addToCart") || "Add to Cart"}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
