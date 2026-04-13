import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, Shield, Store } from 'lucide-react'
import { Button } from '@/components/ui/IconButton'
import { formatPrice, toPersianNumbers } from '@/utils/numberFormat'
import { useTranslation } from '@/i18n/useTranslation'
import type { CartItem as CartItemType } from '@/utils/cartApi'
import useUpdateCartItem from '@/hooks/cart/useUpdateCartItem'
import useRemoveCartItem from '@/hooks/cart/useRemoveCartItem'
import getImageUrl from '@/utils/getImageUrl'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedPath } from '@/hooks/useLocalizedPath'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateCartItem = useUpdateCartItem()
  const removeCartItem = useRemoveCartItem()
  const isMutating = updateCartItem.isPending || removeCartItem.isPending
  const dir = useLangStore(s => s.dir)
  const localizedPath = useLocalizedPath()
  
  const { t } = useTranslation()
  const isRTL = dir == 'rtl'


  const imageUrl = getImageUrl(item.productImage?.thumbnailPath || item.productImage?.filePath)

  return (
    <motion.div
      className="border rounded-lg p-4 bg-white dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4">
        {/* Left Side: Image and Quantity Control */}
        <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
          {/* Product Image */}
          <Link
            to={localizedPath(`/products/${item.productSlug}`)}
            className="w-28"
          >
            <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Store className="h-8 w-8" />
                </div>
              )}
            </div>
          </Link>

          {/* Quantity Control */}
          <div
            className={`flex items-center border rounded-lg bg-white dark:bg-gray-700 w-28 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            {item.quantity === 1 ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  removeCartItem.mutate(item.id)
                }}
                disabled={isMutating}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateCartItem.mutate( { itemId: item.id, quantity: item.quantity - 1 })}
                disabled={isMutating}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
            <span className="px-4 py-2 text-center font-medium">
              {true ? toPersianNumbers(item.quantity) : item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateCartItem.mutate({itemId: item.id, quantity: item.quantity + 1})}
              disabled={isMutating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {item.quantity === 1 && (
            <span className="text-xs text-muted-foreground">
              {t('cart.maximum') || 'Maximum'}
            </span>
          )}
        </div>

        {/* Right Side: Product Details and Price */}
        <div className="flex-1 min-w-0 flex gap-4">
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Product Title */}
            <Link
              to={localizedPath(`/products/${item.productSlug}`)}
              className="block mb-2"
            >
              <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-2">
                {item.productName} {item.variantName && ` - ${item.variantName}`}
              </h3>
            </Link>

            {/* Variant Info */}
            {item.variantAttributes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {item.variantAttributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    {attr.attributeCode.toLowerCase() === 'color' && attr.colorCode && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: attr.colorCode }}
                      />
                    )}
                    <span>
                      {attr.attributeName}: {attr.optionLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Warranty, Seller, Shipping Info */}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              {item.warrantyType && (
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span>{item.warrantyType}</span>
                </div>
              )}
              {item.vendorName && (
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  <span>{item.vendorName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
            {item.unitSalePrice && item.unitDiscount > 0 ? (
              <>
                {/* Row 1: Original Price + Special Sale Badge */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground line-through text-sm">
                    {formatPrice(
                      item.lineTotal,
                      item.currencySymbol
                    )}
                  </span>
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {t('cart.specialSale') || 'Special Sale'}
                  </div>
                </div>
                {/* Row 2: Discount Amount */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                    {formatPrice(
                      item.lineDiscount,
                      item.currencySymbol                    )}{' '}
                    {t('cart.discount') || 'discount'}
                  </span>
                </div>
                {/* Row 3: Final Price */}
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xl font-bold">
                    {formatPrice(
                      item.lineFinalPrice,
                      item.currencySymbol
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-xl font-bold">
                  {formatPrice(
                    item.lineFinalPrice,
                    item.currencySymbol
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}


