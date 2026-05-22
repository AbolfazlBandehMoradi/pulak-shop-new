import { motion } from 'framer-motion';
import { CheckCircle2, Edit2, MapPin, MapPinHouseIcon, MapPinPlus, MoreVertical, Sparkles, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import type { UserAddress } from '@/utils/checkoutApi';

type TranslateFn = (key: string) => string | undefined;

interface CheckoutAddressListProps {
  addresses: UserAddress[];
  selectedAddressId: number | null;
  t: TranslateFn;
  onAddAddress: () => void;
  onSelectAddress: (addressId: number) => void | Promise<void>;
  onEditAddress: (address: UserAddress) => void;
  onDeleteAddress: (addressId: number) => void | Promise<void>;
}

export function CheckoutAddressList({
  addresses,
  selectedAddressId,
  t,
  onAddAddress,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
}: CheckoutAddressListProps) {
  if (addresses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-color-for-layer-on-body rounded-xl border border-dashed border-red-300/50 dark:border-red-300/50 backdrop-blur-xl p-8 text-center"
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="w-full justify-center flex">
          <MapPin className="h-9 w-9 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {t('checkout.noAddresses') || 'No addresses found'}
        </h3>
        <p className="mt-2 text-sm first-text-color-for-paragraph max-w-md mx-auto leading-relaxed">
          {t('checkout.noAddressesMessage') || 'Add a new address to continue your checkout'}
        </p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="mt-4">
          <Button
            onClick={onAddAddress}
            className="group relative inline-flex items-center rounded-lg bg-secound px-4 py-2 text-white"
          >
            {t('checkout.addNewAddress') || 'Add New Address'}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-s-bold first-text-color text-xl flex items-center gap-2">
          {t('checkout.selectAddress') || 'Select Address'}
        </h2>
        <Button
          variant="primary"
          onClick={onAddAddress}
          className="bg-first p-0 rounded-full flex items-center justify-center h-10 w-10"
        >
          <MapPinPlus className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;

          return (
            <motion.div
              key={address.id}
              onClick={() => onSelectAddress(address.id)}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`group relative bg-color-for-layer-on-body rounded-lg cursor-pointer ${
                isSelected ? 'opacity-100 border-2 border-first' : 'opacity-50 hover:opacity-100'
              }`}
            >
              <div className="relative w-full p-4">
                <div className="flex items-center gap-2 w-full justify-between flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.div
                      animate={
                        isSelected
                          ? {
                              scale: [1, 1.08, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                      }}
                      className={isSelected ? 'first-text-color-svg' : ''}
                    >
                      <MapPinHouseIcon className="h-4 w-4" />
                    </motion.div>
                    <h3 className="text-base font-s-bold first-text-color">
                      {address.title || t('checkout.addressTitle') || 'Address'}
                    </h3>
                    {address.isDefault && (
                      <div className="inline-flex items-center gap-1 rounded-full border border-blue-200/70 dark:border-blue-800/50 bg-blue-100/80 dark:bg-blue-900/40 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-200 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" />
                        {t('checkout.setAsDefault') || 'Default'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button
                          type="button"
                          className="p-2 rounded-xl border border-gray-300 dark:border-gray-500 bg-color-for-layer-on-body hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <MoreVertical className="h-4 w-4 first-text-color-svg" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => onEditAddress(address)}
                          className="text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                          {t('checkout.edit') || 'Edit'}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onDeleteAddress(address.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('checkout.delete') || 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="ms-auto"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <hr
                  className={`my-2 ${
                    isSelected ? 'first-text-color-hr text-green-600' : 'first-text-color-hr'
                  }`}
                />

                <div className="flex w-full flex-wrap gap-3">
                  <span className="flex flex-wrap gap-1 text-sm w-full">
                    <span className="font-f-bold text-nowrap first-text-color">
                      {t('checkout.deliveryAddress')}
                    </span>
                    :
                    <span className="first-text-color-for-paragraph">
                      {address.provinceName} . {address.cityName} . {address.streetAddress1}.
                    </span>
                  </span>

                  {address.streetAddress2 && (
                    <span className="flex flex-wrap gap-1 text-sm w-full">
                      <span className="font-f-bold">{t('checkout.streetAddress2')}</span>
                      <span className="first-text-color-for-paragraph">: {address.streetAddress2}</span>
                    </span>
                  )}

                  <div className="flex w-full flex-wrap gap-4">
                    <span className="flex">
                      {(address.firstName || address.lastName) && (
                        <div className="flex w-full text-sm gap-1">
                          <span className="font-f-bold first-text-color">{t('checkout.receiver')}</span>
                          :
                          <span className="first-text-color-for-paragraph">
                            {[address.firstName, address.lastName].filter(Boolean).join(' ') || '-'}
                          </span>
                        </div>
                      )}
                    </span>

                    <span className="flex">
                      {address.phoneNumber && (
                        <div className="flex w-full text-sm gap-1">
                          <span className="font-f-bold first-text-color">{t('checkout.phoneNumber')}</span>
                          :
                          <span className="first-text-color-for-paragraph" dir="ltr">
                            {address.phoneNumber}
                          </span>
                        </div>
                      )}
                    </span>

                    <span className="flex">
                      {address.postalCode && (
                        <div className="flex w-full text-sm gap-1">
                          <span className="font-f-bold first-text-color">{t('checkout.postalCode')}</span>
                          :
                          <span className="first-text-color-for-paragraph" dir="ltr">
                            {address.postalCode}
                          </span>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
