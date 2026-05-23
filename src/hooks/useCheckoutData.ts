import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  deleteAddress,
  getCities,
  getProvinces,
  getUserAddresses,
  saveAddress,
  type City,
  type Province,
  type SaveAddressRequest,
  type UserAddress,
} from '@/utils/checkoutApi';
import { toEnglishNumbers } from '@/utils/numberFormat';

type TranslateFn = (key: string) => string | undefined;

export const DEFAULT_ADDRESS_FORM_VALUES: SaveAddressRequest = {
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

interface UseCheckoutDataParams {
  languageCode: string;
  t: TranslateFn;
}

const mapAddressToFormValues = (address: UserAddress): SaveAddressRequest => ({
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

const hasAnyOptionalAddressField = (address: UserAddress): boolean =>
  Boolean(
    address.title ||
      address.firstName ||
      address.lastName ||
      address.phoneNumber ||
      address.alternativePhoneNumber ||
      address.streetAddress2,
  );

export function useCheckoutData({ languageCode, t }: UseCheckoutDataParams) {
  const [reloadKey, setReloadKey] = useState(0);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const form = useForm<SaveAddressRequest>({
    resolver: zodResolver(addressSchema),
    defaultValues: DEFAULT_ADDRESS_FORM_VALUES,
  });

  const { handleSubmit, reset, setValue, watch } = form;
  const provinceId = watch('provinceId');
  const cityId = watch('cityId');

  const resetAddressForm = () => {
    reset(DEFAULT_ADDRESS_FORM_VALUES);
    setCities([]);
    setShowOptionalFields(false);
  };

  const loadAddresses = async (): Promise<UserAddress[]> => {
    const addressesData = await getUserAddresses(languageCode);
    setAddresses(addressesData);
    return addressesData;
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [provincesData, addressesData] = await Promise.all([
          getProvinces(languageCode),
          getUserAddresses(languageCode),
        ]);

        if (!isMounted) return;

        setProvinces(provincesData);
        setAddresses(addressesData);

        const defaultAddress = addressesData.find((address) => address.isDefault);
        setSelectedAddressId(defaultAddress ? defaultAddress.id : null);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [languageCode, reloadKey]);

  useEffect(() => {
    let isMounted = true;

    if (provinceId > 0) {
      const loadCities = async () => {
        try {
          const citiesData = await getCities(provinceId, languageCode);

          if (!isMounted) return;
          setCities(citiesData);

          if (cityId > 0 && !citiesData.find((city) => city.id === cityId)) {
            setValue('cityId', 0, { shouldDirty: true, shouldValidate: true });
          }
        } catch (err) {
          if (isMounted) {
            console.error('Failed to load cities:', err);
          }
        }
      };

      loadCities();
    } else {
      setCities([]);
      if (cityId > 0) {
        setValue('cityId', 0, { shouldDirty: true, shouldValidate: true });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [provinceId, cityId, languageCode, setValue]);

  const openCreateAddressForm = () => {
    setEditingAddress(null);
    resetAddressForm();
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address: UserAddress) => {
    setEditingAddress(address);
    reset(mapAddressToFormValues(address));
    setShowOptionalFields(hasAnyOptionalAddressField(address));
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddressForm();
  };

  const saveAddressForm = handleSubmit(async (data) => {
    setSaving(true);
    setError(null);

    try {
      const addressData: SaveAddressRequest = {
        ...data,
        id: editingAddress?.id,
        postalCode: toEnglishNumbers(data.postalCode),
        phoneNumber: data.phoneNumber ? toEnglishNumbers(data.phoneNumber) : '',
        alternativePhoneNumber: data.alternativePhoneNumber
          ? toEnglishNumbers(data.alternativePhoneNumber)
          : '',
      };

      const savedAddress = await saveAddress(addressData, languageCode);
      await loadAddresses();

      setSelectedAddressId(savedAddress.id);
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
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

  const deleteAddressById = async (addressId: number) => {
    setError(null);

    try {
      await deleteAddress(addressId, languageCode);
      const addressesData = await loadAddresses();

      const defaultAddress = addressesData.find((address) => address.isDefault);
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
        resetAddressForm();
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('checkout.addressDeleteError') || 'Failed to delete address',
      );
    }
  };

  const selectAddress = (addressId: number) => {
    setSelectedAddressId(addressId);
  };

  const continueToPayment = async (): Promise<boolean> => {
    if (!selectedAddressId) {
      setError(t('checkout.validation.required') || 'Please select or add an address');
      return false;
    }

    const selectedAddress = addresses.find((address) => address.id === selectedAddressId);

    if (!selectedAddress) {
      setError(t('checkout.validation.required') || 'Please select or add an address');
      return false;
    }

    return true;
  };

  const retryLoad = () => {
    setReloadKey((value) => value + 1);
  };

  const toggleOptionalFields = () => {
    setShowOptionalFields((previousValue) => !previousValue);
  };

  return {
    addresses,
    provinces,
    cities,
    selectedAddressId,
    showAddressForm,
    editingAddress,
    showOptionalFields,
    loading,
    saving,
    error,
    form,
    provinceId,
    retryLoad,
    openCreateAddressForm,
    openEditAddressForm,
    closeAddressForm,
    saveAddressForm,
    deleteAddressById,
    selectAddress,
    continueToPayment,
    toggleOptionalFields,
  };
}
