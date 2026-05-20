import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Backpack, Minus, Shield, Store, Activity } from 'lucide-react';
import { Button } from '@/components/ui/IconButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { toPersianNumbers } from '@/utils/numberFormat';
import { useTranslation } from '@/i18n/useTranslation';
import type { CartItem as CartItemType } from '@/utils/cartApi';
import useUpdateCartItem from '@/hooks/cart/useUpdateCartItem';
import useRemoveCartItem from '@/hooks/cart/useRemoveCartItem';
import getImageUrl from '@/utils/getImageUrl';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { AppModal } from '@/components/reusable-components/AppModal/AppModal';

interface CartItemProps {
  item: CartItemType;
}
export function CartItem({ item }: CartItemProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const isMutating = updateCartItem.isPending || removeCartItem.isPending;
  const dir = useLangStore((s) => s.dir);
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation();
  const isRTL = dir == 'rtl';
  const imageUrl = getImageUrl(item.productImage?.thumbnailPath || item.productImage?.filePath);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [pendingTo, setPendingTo] = useState<string | null>(null);
  const navigate = useNavigate();
  console.log(item);
  return (
    <>
      <motion.div
        className="flex w-full items-center justify-between flex-wrap relative  bg-color-for-layer-on-body p-4 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          className=" w-24/96 md:w-16/96 lg:w-16/96 xl:w-12/96 h-24  flex items-center border  p-2 md:p-4 rounded-xl border-gray-300 dark:border-gray-500 justify-center "
          to={''}
          onClick={() => {
            setPendingTo(localizedPath(`/products/${item.productSlug}`));
            setOpenConfirm(true);
          }}
        >
          {imageUrl ? (
            <div className="w-full h-full overflow-hidden">
              <img src={imageUrl} alt={item.productName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="">
              <Store className="h-8 w-8" />
            </div>
          )}
        </Link>
        <div className="w-68/96 md:w-54/96 lg:w-54/96 xl:w-62/96  ">
          <button
            type="button"
            onClick={() => {
              setPendingTo(localizedPath(`/products/${item.productSlug}`));
              setOpenConfirm(true);
            }}
            className=" font-s-medium   first-text-color text-start"
          >
            {item.productName} {item.variantName && ` - ${item.variantName}`}
          </button>
          <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
            {isRTL ? (
              // 🇮🇷 فارسی
              <div className="flex flex-col w-full items-start text-right mt-2 gap-1">
                {/* حالت تخفیف */}
                {item.unitSalePrice && item.unitDiscount > 0 ? (
                  <>
                    <div className="flex items-center justify-between md:justify-start w-full gap-2">
                      <PriceDisplay
                        currencyMode="symbol"
                        currencyClassName="w-6 h-6 text-secound dark:text-secound-400"
                        amount={item.lineFinalPrice}
                        languageCode="fa"
                        variant="primary"
                        className="font-s-sbold first-text-color "
                      />
                      <div className="flex items-center  gap-2">
                        <span className="first-text-color-for-paragraph text-sm relative">
                          <PriceDisplay
                            currencyMode="none"
                            amount={item.lineTotal}
                            languageCode="fa"
                            variant="secondary"
                          />
                          <span className="bg-color-for-red absolute h-0.5 opacity-30 rotate-15 top-2 left-0 right-0" />
                        </span>
                        <div className="bg-yellow-50 flex items-center gap-1 px-1.5 py-1 rounded">
                          <span className="text-yellow-600 text-[10px]">
                            {t('cart.cart.specialSale') || 'Special Sale'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.quantity > 1 && (
                      <span className="text-xs first-text-color-for-paragraph">
                        <PriceDisplay
                          amount={item.unitSalePrice} // ✅ فقط قیمت تخفیف‌خورده
                          languageCode="fa"
                          currencyMode="none"
                        />{' '}
                        × {toPersianNumbers(item.quantity)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {/* قیمت بدون تخفیف */}
                    <PriceDisplay
                      currencyMode="symbol"
                      currencyClassName="w-6 h-6 text-secound dark:text-secound-400"
                      amount={item.lineFinalPrice}
                      languageCode="fa"
                      variant="primary"
                      className="font-s-sbold first-text-color"
                    />

                    {/* quantity × unit */}
                    {item.quantity > 1 && (
                      <span className="text-xs first-text-color-for-paragraph">
                        <PriceDisplay
                          amount={item.unitPrice}
                          languageCode="fa"
                          currencyMode="none"
                        />{' '}
                        × {toPersianNumbers(item.quantity)}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              // 🇬🇧 English
              <div className="flex flex-col items-start text-left gap-1">
                {/* Discount */}
                {item.unitSalePrice && item.unitDiscount > 0 ? (
                  <>
                    {/* Original price */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 line-through">
                        <PriceDisplay
                          amount={item.lineTotal}
                          languageCode="en"
                          currency="USD"
                          currencyMode="symbol"
                          variant="secondary"
                        />
                      </span>

                      <div className="bg-yellow-50 flex items-center gap-1 px-1.5 py-1 rounded">
                        <span className="text-yellow-600 text-[10px]">
                          {t('cart.cart.specialSale') || 'Special Sale'}
                        </span>
                      </div>
                    </div>

                    {/* Final price */}
                    <PriceDisplay
                      amount={item.lineFinalPrice}
                      languageCode="en"
                      currency="USD"
                      currencyMode="symbol"
                      variant="primary"
                      className="text-lg font-bold"
                    />

                    {/* quantity × unit */}
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400">
                        <PriceDisplay
                          amount={item.unitSalePrice} // ✅ درست
                          languageCode="en"
                          currency="USD"
                          currencyMode="none"
                        />{' '}
                        × {item.quantity}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {/* normal price */}
                    <PriceDisplay
                      amount={item.lineFinalPrice}
                      languageCode="en"
                      currency="USD"
                      currencyMode="symbol"
                      variant="primary"
                      className="text-lg font-bold"
                    />

                    {/* quantity × unit */}
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400">
                        <PriceDisplay
                          amount={item.unitPrice}
                          languageCode="en"
                          currency="USD"
                          currencyMode="none"
                        />{' '}
                        × {item.quantity}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center  w-full md:w-24/96 xl:w-20/96">
          <div
            className={cn(
              'flex items-center md:py-2 rounded-lg bg-secound w-full mt-4',
              isRTL && 'flex-row-reverse',
            )}
          >
            {item.quantity === 1 ? (
              <div className="w-36/96">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    removeCartItem.mutate(item.id);
                  }}
                  disabled={isMutating}
                  className="text-white w-full"
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
                  onClick={() =>
                    updateCartItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                  }
                  disabled={isMutating}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="w-36/96 flex items-center justify-center">
              <span className="font-f-bold text-white">
                {true ? toPersianNumbers(item.quantity) : item.quantity}{' '}
              </span>
            </div>
            <div className="w-36/96">
              <Button
                variant="ghost"
                className="w-full text-white"
                size="icon"
                onClick={() =>
                  updateCartItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                }
                disabled={isMutating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {item.quantity === item.stock && (
          <span className="text-xs w-full flex justify-center mt-2 first-text-color-red">
            {t('cart.cart.maximum') || 'Maximum'}
            {item.quantity}
          </span>
        )}
      </motion.div>
      <AppModal
        isOpen={openConfirm}
        onClose={() => setOpenConfirm(false)}
        icon={<Shield className="w-12 h-12 text-yellow-500" />}
        title="Are you sure?"
        description="Do you want to go back to product details?"
        buttons={[
          {
            label: 'No',
            variant: 'outline',
            onClick: () => setOpenConfirm(false),
          },
          {
            label: 'Yes',
            variant: 'primary',
            onClick: () => {
              if (pendingTo) {
                navigate(pendingTo);
              }
            },
          },
        ]}
      />
    </>
  );
}
