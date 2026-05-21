import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreVertical, ReceiptText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  MapPinHouseIcon,
  MapPinPlus,
  ShoppingBag,
  Package,
  User,
  Phone,
  Building2,
  Home,
  Mail,
  FileText,
  MapPinHouse,
  Save,
  ArrowRight,
  Tag,
  ShoppingCart,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  getUserAddresses,
  getProvinces,
  getCities,
  saveAddress,
  setDefaultAddress,
  deleteAddress,
  type UserAddress,
  type Province,
  type City,
  type SaveAddressRequest,
} from '@/utils/checkoutApi';
import { getCart, type Cart } from '@/utils/cartApi';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { toPersianNumbers, toEnglishNumbers } from '@/utils/numberFormat';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';

const DEFAULT_ADDRESS_FORM_VALUES: SaveAddressRequest = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  alternativePhoneNumber: '',
  streetAddress1: '',
  streetAddress2: '',
  postalCode: '',
  provinceId: 0,
  cityId: 0,
  additionalDetails: '',
  isDefault: false,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();

  // Determine language code
  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';
  const [reloadKey, setReloadKey] = useState(0);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);

  const addressSchema = useMemo(() => {
    const requiredMessage = t('checkout.validation.required') || 'This field is required';
    const postalCodeInvalidMessage =
      t('checkout.validation.postalCodeInvalid') || 'Invalid postal code format';
    const phoneInvalidMessage =
      t('checkout.validation.phoneInvalid') || 'Invalid phone number format';

    return z.object({
      id: z.number().optional(),
      title: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phoneNumber: z
        .string()
        .optional()
        .refine((value) => {
          if (!value || !value.trim()) return true;
          return /^09\d{9}$/.test(toEnglishNumbers(value.replace(/\s/g, '')));
        }, phoneInvalidMessage),
      alternativePhoneNumber: z.string().optional(),
      streetAddress1: z.string().trim().min(1, requiredMessage),
      streetAddress2: z.string().optional(),
      postalCode: z
        .string()
        .trim()
        .min(1, requiredMessage)
        .refine(
          (value) => /^\d{10}$/.test(toEnglishNumbers(value.replace(/\s/g, ''))),
          postalCodeInvalidMessage,
        ),
      provinceId: z.number().refine((value) => value > 0, requiredMessage),
      cityId: z.number().refine((value) => value > 0, requiredMessage),
      additionalDetails: z.string().optional(),
      isDefault: z.boolean().optional(),
    });
  }, [t]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors: formErrors },
  } = useForm<SaveAddressRequest>({
    resolver: zodResolver(addressSchema),
    defaultValues: DEFAULT_ADDRESS_FORM_VALUES,
  });

  const provinceId = watch('provinceId');
  const cityId = watch('cityId');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load cart and provinces in parallel
        const [cartData, provincesData] = await Promise.all([
          getCart(effectiveLangCode),
          getProvinces(effectiveLangCode),
        ]);

        setCart(cartData);
        setProvinces(provincesData);

        // Load addresses (user must be authenticated)
        const addressesData = await getUserAddresses(effectiveLangCode);
        setAddresses(addressesData);

        // Select default address if exists
        const defaultAddress = addressesData.find((a) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [effectiveLangCode, reloadKey]);

  // Load cities when province changes
  useEffect(() => {
    if (provinceId > 0) {
      const loadCities = async () => {
        try {
          const citiesData = await getCities(provinceId, effectiveLangCode);
          setCities(citiesData);

          // Reset city selection if current city is not in new list
          if (cityId > 0 && !citiesData.find((c) => c.id === cityId)) {
            setValue('cityId', 0, { shouldDirty: true, shouldValidate: true });
          }
        } catch (err) {
          console.error('Failed to load cities:', err);
        }
      };
      loadCities();
    } else {
      setCities([]);
      if (cityId > 0) {
        setValue('cityId', 0, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [provinceId, cityId, effectiveLangCode, setValue]);

  const handleSaveAddress = handleSubmit(async (data) => {
    setSaving(true);
    setError(null);

    try {
      // Ensure postal code and phone numbers are normalized before saving
      const addressData: SaveAddressRequest = {
        ...data,
        id: editingAddress?.id,
        postalCode: toEnglishNumbers(data.postalCode),
        phoneNumber: data.phoneNumber ? toEnglishNumbers(data.phoneNumber) : '',
        alternativePhoneNumber: data.alternativePhoneNumber
          ? toEnglishNumbers(data.alternativePhoneNumber)
          : '',
      };

      const savedAddress = await saveAddress(addressData, effectiveLangCode);

      // Reload addresses
      const addressesData = await getUserAddresses(effectiveLangCode);
      setAddresses(addressesData);

      // Select the saved address
      setSelectedAddressId(savedAddress.id);
      setShowAddressForm(false);
      setEditingAddress(null);

      // Reset form
      reset(DEFAULT_ADDRESS_FORM_VALUES);
      setCities([]);
    } catch (err) {
      console.error('Failed to save address:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('checkout.addressSaveError') || 'Failed to save address',
      );
    } finally {
      setSaving(false);
    }
  });

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    reset({
      id: address.id,
      title: address.title || '',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phoneNumber: address.phoneNumber || '',
      alternativePhoneNumber: address.alternativePhoneNumber || '',
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2 || '',
      postalCode: address.postalCode,
      provinceId: address.provinceId,
      cityId: address.cityId,
      additionalDetails: address.additionalDetails || '',
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    setDeletingAddressId(addressId);
    setError(null);

    try {
      await deleteAddress(addressId, effectiveLangCode);
      const addressesData = await getUserAddresses(effectiveLangCode);
      setAddresses(addressesData);

      const defaultAddress = addressesData.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      } else {
        setSelectedAddressId(null);
      }

      if (editingAddress?.id === addressId) {
        setEditingAddress(null);
        setShowAddressForm(false);
        reset(DEFAULT_ADDRESS_FORM_VALUES);
        setCities([]);
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('checkout.addressDeleteError') || 'Failed to delete address',
      );
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSelectAddress = async (addressId: number) => {
    setSelectedAddressId(addressId);

    // Find the selected address
    const selectedAddress = addresses.find((a) => a.id === addressId);

    // If the selected address is not the default, set it as default
    if (selectedAddress && !selectedAddress.isDefault) {
      try {
        await setDefaultAddress(addressId, effectiveLangCode);

        // Update the addresses list to reflect the change
        setAddresses((prevAddresses) =>
          prevAddresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          })),
        );
      } catch (err) {
        console.error('Failed to set default address:', err);
        setError(
          err instanceof Error
            ? err.message
            : t('checkout.defaultAddressError') || 'Failed to set default address',
        );
      }
    }
  };

  const handleContinue = async () => {
    // Check if address is selected
    if (!selectedAddressId) {
      setError(t('checkout.validation.required') || 'Please select or add an address');
      return;
    }

    // Find the selected address
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    if (!selectedAddress) {
      setError(t('checkout.validation.required') || 'Please select or add an address');
      return;
    }

    // Ensure the selected address is set as default
    if (!selectedAddress.isDefault) {
      try {
        await setDefaultAddress(selectedAddressId, effectiveLangCode);

        // Update the addresses list to reflect the change
        setAddresses((prevAddresses) =>
          prevAddresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === selectedAddressId,
          })),
        );
      } catch (err) {
        console.error('Failed to set default address:', err);
        setError(
          err instanceof Error
            ? err.message
            : t('checkout.defaultAddressError') || 'Failed to set default address',
        );
        return;
      }
    }

    // Navigate to payment page
    navigate(localizedPath(`/payment`));
  };

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  return (
    <main className="mx-auto mt-20 lg:mt-8 px-4 sm:container">
      <CheckoutStepper currentStep={2} />
      <div className="mb-6">
        <div className="flex items-center justify-between  gap-3 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-s-bold first-text-color text-xl">
              {t('checkout.title') || 'Checkout'}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(localizedPath(`/cart`))}
            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            {t('checkout.backToCart') || 'Back to Cart'}
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
            <Button
              onClick={() => setReloadKey((value) => value + 1)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.retry') || 'Retry'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {addresses.length > 0 && !showAddressForm && (
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
                    onClick={() => {
                      setEditingAddress(null);
                      reset(DEFAULT_ADDRESS_FORM_VALUES);
                      setCities([]);
                      setShowAddressForm(true);
                    }}
                    className="bg-first p-0 rounded-full flex items-center justify-center h-10 w-10 "
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
                        onClick={() => handleSelectAddress(address.id)}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className={`group relative  bg-color-for-layer-on-body rounded-lg  cursor-pointer  ${
                          isSelected
                            ? 'opacity-100 border-2 border-first'
                            : 'opacity-50  hover:opacity-100'
                        }`}
                      >
                        <div className="relative  w-full p-4 ">
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
                                className={` ${isSelected ? 'first-text-color-svg' : ''}`}
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
                                    className="p-2 rounded-xl border border-gray-300 dark:border-gray-500 bg-color-for-layer-on-body hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                  >
                                    <MoreVertical className="h-4 w-4 first-text-color-svg" />
                                  </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleEditAddress(address)}
                                    className="text-blue-600"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    {t('checkout.edit') || 'Edit'}
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleDeleteAddress(address.id)}
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
                            className={`my-2   ${
                              isSelected
                                ? 'first-text-color-hr text-green-600'
                                : 'first-text-color-hr'
                            }`}
                          />
                          <div className="flex w-full flex-wrap gap-3 ">
                            <span className="flex flex-wrap gap-1 text-sm w-full  ">
                              <span className="font-f-bold text-nowrap first-text-color">
                                {t('checkout.deliveryAddress')}
                              </span>
                              :
                              <span className="first-text-color-for-paragraph">
                                {address.provinceName} . {address.cityName} .{' '}
                                {address.streetAddress1}.
                              </span>
                            </span>
                            {address.streetAddress2 && (
                              <span className="flex flex-wrap gap-1 text-sm w-full">
                                <span className="font-f-bold">
                                  {t('checkout.streetAddress2')}
                                </span>

                                <span className="first-text-color-for-paragraph">
                                  : {address.streetAddress2}
                                </span>
                              </span>
                            )}
                            <div className="flex w-full flex-wrap gap-4">
                              <span className="flex  ">
                                {(address.firstName || address.lastName) && (
                                  <div className="flex w-full text-sm gap-1">
                                    <span className="font-f-bold first-text-color">
                                      {t('checkout.receiver')}
                                    </span>
                                    :
                                    <span className="first-text-color-for-paragraph">
                                      {[address.firstName, address.lastName]
                                        .filter(Boolean)
                                        .join(' ') || '-'}
                                    </span>
                                  </div>
                                )}
                              </span>
                              <span className="flex">
                                {address.phoneNumber && (
                                  <div className="flex w-full text-sm gap-1">
                                    <span className="flex gap-1">
                                      <span className="font-f-bold first-text-color">
                                        {t('checkout.phoneNumber')}
                                      </span>
                                    </span>
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
                                    <span className="flex gap-1">
                                      <span className="font-f-bold first-text-color">
                                        {t('checkout.postalCode')}
                                      </span>
                                    </span>
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
            )}

            {showAddressForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-color-for-layer-on-body rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg">
                    <MapPinHouse className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-s-bold first-text-color">
                    {editingAddress
                      ? t('checkout.editAddress') || 'Edit Address'
                      : t('checkout.addNewAddress') || 'Add New Address'}
                  </h2>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs  mb-2 flex items-center first-text-color-for-paragraph">
                        <span className="me-1">{t('checkout.province') || 'Province'}</span>(
                        <span className="first-text-color-red">
                          {t('checkout.required') || 'required'})
                        </span>
                      </label>
                      <Controller
                        name="provinceId"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={provinces.map((province) => ({
                              value: province.id,
                              label: province.name,
                            }))}
                            value={field.value ?? 0}
                            onChange={(value) => {
                              field.onChange(Number(value));
                              setValue('cityId', 0);
                            }}
                            placeholder={t('checkout.selectProvince') || 'Select Province'}
                            searchPlaceholder={
                              t('checkout.searchProvince') || 'Search provinces...'
                            }
                            emptyMessage={
                              t('checkout.noProvincesFound') || 'No provinces found'
                            }
                            error={!!formErrors.provinceId}
                            className={formErrors.provinceId ? 'border-red-500' : ''}
                          />
                        )}
                      />
                      {formErrors.provinceId?.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {String(formErrors.provinceId.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs mb-2 flex items-center first-text-color">
                        <span className="me-1">{t('checkout.city') || 'city'}</span>(
                        <span className="first-text-color-red">
                          {t('checkout.required') || 'required'})
                        </span>
                      </label>
                      <Controller
                        name="cityId"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={cities.map((city) => ({
                              value: city.id,
                              label: city.name,
                            }))}
                            value={field.value ?? 0}
                            onChange={(value) => field.onChange(Number(value))}
                            placeholder={t('checkout.selectCity') || 'Select City'}
                            searchPlaceholder={t('checkout.searchCity') || 'Search cities...'}
                            emptyMessage={t('checkout.noCitiesFound') || 'No cities found'}
                            disabled={provinceId <= 0}
                            error={!!formErrors.cityId}
                            className={formErrors.cityId ? 'border-red-500' : ''}
                          />
                        )}
                      />
                      {formErrors.cityId?.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {String(formErrors.cityId.message)}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                        <span className="me-1">
                          {t('checkout.streetAddress') || 'Address Description'}
                        </span>
                        (
                        <span className="first-text-color-red">
                          {t('checkout.required') || 'required'}
                        </span>
                        )
                      </label>

                      <textarea
                        {...register('streetAddress1')}
                        rows={3}
                        placeholder={
                          t('checkout.streetAddressPlaceholder') || 'Enter address description'
                        }
                        className={`w-full rounded-md border border-gray-300 dark:border-gray-500 bg-color-for-layer-sec px-3 py-2 text-sm resize-none first-text-color-for-paragraph transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.streetAddress1 ? 'border-red-500' : 'border-input'
                        }`}
                      />

                      {formErrors.streetAddress1?.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {String(formErrors.streetAddress1.message)}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs  mb-2 flex items-center first-text-color-for-paragraph">
                        <span className="me-1">
                          {t('checkout.postalCode') || 'Postal Code'}
                        </span>
                        (
                        <span className="first-text-color-red">
                          {t('checkout.required') || 'required'})
                        </span>
                      </label>
                      <Controller
                        name="postalCode"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const onlyNumbers = toEnglishNumbers(e.target.value).replace(
                                /\D/g,
                                '',
                              );
                              field.onChange(onlyNumbers);
                            }}
                            placeholder={
                              t('checkout.postalCodePlaceholder') || 'Enter postal code'
                            }
                            className={formErrors.postalCode ? 'border-red-500' : 'text-right'}
                          />
                        )}
                      />
                      {formErrors.postalCode?.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {String(formErrors.postalCode.message)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Fields Section */}
                <div className="pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields((prev) => !prev)}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold first-text-color-for-paragraph">
                        {t('checkout.optionalInformation') || 'Optional Information'}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: showOptionalFields ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="h-4 w-4 first-text-color-for-paragraph-low " />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {showOptionalFields && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                          {/* Address Title */}
                          <div>
                            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.addressTitle') || 'Address Title'}
                            </label>

                            <Input
                              {...register('title')}
                              placeholder={
                                t('checkout.addressTitlePlaceholder') ||
                                'e.g., Home, Work, Office'
                              }
                            />
                          </div>

                          {/* First Name */}
                          <div>
                            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.firstName') || 'First Name'}
                            </label>

                            <Input
                              {...register('firstName')}
                              placeholder={
                                t('checkout.firstNamePlaceholder') || 'Enter first name'
                              }
                            />
                          </div>

                          {/* Last Name */}
                          <div>
                            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.lastName') || 'Last Name'}
                            </label>

                            <Input
                              {...register('lastName')}
                              placeholder={
                                t('checkout.lastNamePlaceholder') || 'Enter last name'
                              }
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.phoneNumber') || 'Phone Number'}
                            </label>

                            <Controller
                              name="phoneNumber"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="tel"
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(toEnglishNumbers(e.target.value))}
                                  placeholder={
                                    t('checkout.phoneNumberPlaceholder') ||
                                    'Enter phone number'
                                  }
                                  className={formErrors.phoneNumber ? 'border-red-500' : ''}
                                />
                              )}
                            />
                          </div>

                          {/* Alternative Phone */}
                          <div>
                            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.alternativePhoneNumber') ||
                                'Alternative Phone Number'}
                            </label>

                            <Controller
                              name="alternativePhoneNumber"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="tel"
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(toEnglishNumbers(e.target.value))}
                                  placeholder={
                                    t('checkout.alternativePhoneNumberPlaceholder') ||
                                    'Optional'
                                  }
                                />
                              )}
                            />
                          </div>

                          {/* Address 2 */}
                          <div className="md:col-span-2">
                            <label className="text-xs  mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                              {t('checkout.streetAddress2') || 'Street Address 2'}
                            </label>
                            <Input
                              {...register('streetAddress2')}
                              placeholder={
                                t('checkout.streetAddress2Placeholder') ||
                                'Apartment, suite, etc.'
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="group relative w-full items-center  rounded-lg bg-secound px-4 py-2 text-white  "
                    size="md"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {t('common.loading') || 'Loading...'}
                      </>
                    ) : (
                      <>
                        <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('checkout.saveAddress') || 'Save Address'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-red-500 first-text-color"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      reset(DEFAULT_ADDRESS_FORM_VALUES);
                      setCities([]);
                    }}
                  >
                    {t('checkout.cancel') || 'Cancel'}
                  </Button>
                </div>
              </motion.div>
            )}

            {addresses.length === 0 && !showAddressForm && (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden bg-color-for-layer-on-body rounded-xl border border-dashed border-red-300/50 dark:border-red-300/50   backdrop-blur-xl p-8 text-center "
              >
                {/* Soft animated glow */}
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
                ></motion.div>
                <div className="w-full justify-center flex">
                  <MapPin className="h-9 w-9 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {t('checkout.noAddresses') || 'No addresses found'}
                </h3>
                <p className="mt-2 text-sm first-text-color-for-paragraph max-w-md mx-auto leading-relaxed">
                  {t('checkout.noAddressesMessage') ||
                    'Add a new address to continue your checkout'}
                </p>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button
                    onClick={() => {
                      reset(DEFAULT_ADDRESS_FORM_VALUES);
                      setCities([]);
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="group relative inline-flex items-center  rounded-lg bg-secound px-4 py-2 text-white  "
                  >
                    {t('checkout.addNewAddress') || 'Add New Address'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary & Continue Button */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-25">
              <div className="rounded-lg  bg-color-for-layer-on-body p-6 space-y-2">
                {cart && cart.items.length > 0 && (
                  <>
                    <span className="flex w-full justify-center  items-center gap-2">
                      <span className="first-text-color-svg">
                        <ReceiptText strokeWidth={1} className="w-6 h-6" />
                      </span>
                      <h2 className="text-xl font-s-sbold first-text-color ">
                        {t('cart.orderSummary')}
                      </h2>
                    </span>
                    <hr className="first-text-color-hr my-2" />
                    <div className={`flex justify-between items-center${isRTL ? '' : ''}`}>
                      {effectiveLangCode === 'fa' ? (
                        <>
                          <span className="font-f-sbold te first-text-color-for-paragraph">
                            {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
                          </span>
                          <span className="font-f-normal first-text-color">
                            <PriceDisplay amount={cart.subtotal} languageCode={effectiveLangCode} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            {t('cart.priceOfItems') || 'Price of items'} ({cart.itemCount})
                          </span>
                          <span className="font-semibold">
                            <PriceDisplay amount={cart.subtotal} languageCode={effectiveLangCode} />
                          </span>
                        </>
                      )}
                    </div>

                    {/* Your Profit (Discount) */}
                    {cart.totalDiscount > 0 && (
                      <div
                        className={`flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {effectiveLangCode === 'fa' ? (
                          <>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              <PriceDisplay
                                amount={cart.totalDiscount}
                                languageCode={effectiveLangCode}
                              />
                            </span>
                            <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {t('cart.yourProfit') || 'Your profit from purchase'} (
                              {effectiveLangCode === 'fa'
                                ? toPersianNumbers(
                                    Math.round((cart.totalDiscount / cart.subtotal) * 100),
                                  )
                                : Math.round((cart.totalDiscount / cart.subtotal) * 100)}
                              %)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {t('cart.yourProfit') || 'Your profit from purchase'} (
                              {currentLanguage == 'fa'
                                ? toPersianNumbers(
                                    Math.round((cart.totalDiscount / cart.subtotal) * 100),
                                  )
                                : Math.round((cart.totalDiscount / cart.subtotal) * 100)}
                              %)
                            </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              -
                              <PriceDisplay
                                amount={cart.totalDiscount}
                                languageCode={effectiveLangCode}
                              />
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Cart Total */}
                    <div
                      className={`flex justify-between items-center${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {effectiveLangCode === 'fa' ? (
                        <>
                          <span className="first-text-color font-f-bold">
                            {t('cart.cartTotal') || 'Cart Total'}
                          </span>
                          <span className="font-bold text-lg text-red-600 dark:text-red-400">
                            <PriceDisplay amount={cart.total} languageCode={effectiveLangCode} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-foreground font-bold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-red-500" />
                            {t('cart.cartTotal') || 'Cart Total'}
                          </span>
                          <span className="font-bold text-lg text-red-600 dark:text-red-400">
                            <PriceDisplay amount={cart.total} languageCode={effectiveLangCode} />
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <Button
                    onClick={handleContinue}
                    className="w-full font-s-sbold bg-first text-white"
                    size="lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t('checkout.continue') || 'Continue'}
                      <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </Button>
                </div>

                {/* Info Note */}
                {cart && cart.items.length > 0 && (
                  <p className="text-xs first-text-color-for-paragraph-low">
                    {t('cart.paymentNote')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
