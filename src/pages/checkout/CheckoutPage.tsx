import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  Package,
  User,
  Phone,
  Building2,
  Home,
  Mail,
  FileText,
  Save,
  ArrowRight,
  Tag,
  ShoppingCart,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
} from "@/utils/checkoutApi";
import { getCart, type Cart } from "@/utils/cartApi";
import {
  formatPrice,
  toPersianNumbers,
  toEnglishNumbers,
} from "@/utils/numberFormat";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

const DEFAULT_ADDRESS_FORM_VALUES: SaveAddressRequest = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  alternativePhoneNumber: "",
  streetAddress1: "",
  streetAddress2: "",
  postalCode: "",
  provinceId: 0,
  cityId: 0,
  additionalDetails: "",
  isDefault: false,
};


export default function CheckoutPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((s) => s.lang);
  const { t } = useTranslation();

  // Determine language code
  const effectiveLangCode = currentLanguage || "fa";

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);

  const addressSchema = useMemo(() => {
    const requiredMessage =
      t("checkout.validation.required") || "This field is required";
    const postalCodeInvalidMessage =
      t("checkout.validation.postalCodeInvalid") ||
      "Invalid postal code format";
    const phoneInvalidMessage =
      t("checkout.validation.phoneInvalid") || "Invalid phone number format";

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
          return /^09\d{9}$/.test(toEnglishNumbers(value.replace(/\s/g, "")));
        }, phoneInvalidMessage),
      alternativePhoneNumber: z.string().optional(),
      streetAddress1: z.string().trim().min(1, requiredMessage),
      streetAddress2: z.string().optional(),
      postalCode: z
        .string()
        .trim()
        .min(1, requiredMessage)
        .refine(
          (value) => /^\d{10}$/.test(toEnglishNumbers(value.replace(/\s/g, ""))),
          postalCodeInvalidMessage
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

  const provinceId = watch("provinceId");
  const cityId = watch("cityId");


  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

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
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [effectiveLangCode]);

  // Load cities when province changes
  useEffect(() => {
    if (provinceId > 0) {
      const loadCities = async () => {
        try {
          const citiesData = await getCities(provinceId, effectiveLangCode);
          setCities(citiesData);

          // Reset city selection if current city is not in new list
          if (cityId > 0 && !citiesData.find((c) => c.id === cityId)) {
            setValue("cityId", 0, { shouldDirty: true, shouldValidate: true });
          }
        } catch (err) {
          console.error("Failed to load cities:", err);
        }
      };
      loadCities();
    } else {
      setCities([]);
      if (cityId > 0) {
        setValue("cityId", 0, { shouldDirty: true, shouldValidate: true });
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
        phoneNumber: data.phoneNumber
          ? toEnglishNumbers(data.phoneNumber)
          : "",
        alternativePhoneNumber: data.alternativePhoneNumber
          ? toEnglishNumbers(data.alternativePhoneNumber)
          : "",
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
      console.error("Failed to save address:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("checkout.addressSaveError") || "Failed to save address"
      );
    } finally {
      setSaving(false);
    }
  });

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    reset({
      id: address.id,
      title: address.title || "",
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      phoneNumber: address.phoneNumber || "",
      alternativePhoneNumber: address.alternativePhoneNumber || "",
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2 || "",
      postalCode: address.postalCode,
      provinceId: address.provinceId,
      cityId: address.cityId,
      additionalDetails: address.additionalDetails || "",
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
      console.error("Failed to delete address:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("checkout.addressDeleteError") || "Failed to delete address"
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
          }))
        );
      } catch (err) {
        console.error("Failed to set default address:", err);
        setError(
          err instanceof Error ? err.message : "Failed to set default address"
        );
      }
    }
  };

  const handleContinue = async () => {
    // Check if address is selected
    if (!selectedAddressId) {
      setError(
        t("checkout.validation.required") || "Please select or add an address"
      );
      return;
    }

    // Find the selected address
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    if (!selectedAddress) {
      setError(
        t("checkout.validation.required") || "Please select or add an address"
      );
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
          }))
        );
      } catch (err) {
        console.error("Failed to set default address:", err);
        setError(
          err instanceof Error ? err.message : "Failed to set default address"
        );
        return;
      }
    }

    // Navigate to payment page
    navigate(localizedPath(`/payment`));
  };

  const isRTL = true;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
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
            {/* Step 1: Cart - Completed */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t("cart.yourShoppingCart") || "Cart"}
                </span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex-1 h-0.5 bg-blue-400 relative">
              <div className="absolute inset-0 bg-linear-to-rfrom-blue-400 to-blue-400"></div>
            </div>

            {/* Step 2: Checkout - Active */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-400 smooth-pulse"></div>
                <div className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {t("checkout.title") || "Checkout"}
                </span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 relative">
              <div className="absolute inset-0 bg-linear-to-rfrom-blue-400 to-gray-200 dark:from-blue-500 dark:to-gray-700 w-0"></div>
            </div>

            {/* Step 3: Payment */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-muted-foreground">
                  {effectiveLangCode === "fa" ? "پرداخت" : "Payment"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-r from-red-500 to-red-600 rounded-lg shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {t("checkout.title") || "Checkout"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {t("checkout.deliveryAddress") || "Delivery Address"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(localizedPath(`/cart`))}
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("checkout.backToCart") || "Back to Cart"}
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
              <p className="text-red-600 dark:text-red-400 text-lg font-medium">
                {error}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("common.retry") || "Retry"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Address Selection/Form */}
            <div className="lg:col-span-2 space-y-6">
              {addresses.length > 0 && !showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      {t("checkout.selectAddress") || "Select Address"}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingAddress(null);
                        reset(DEFAULT_ADDRESS_FORM_VALUES);
                        setCities([]);
                        setShowAddressForm(true);
                      }}
                      className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("checkout.addNewAddress") || "Add New Address"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out shadow-sm ${
                          selectedAddressId === address.id
                            ? "border-red-400/60 bg-linear-to-r from-red-50/80 to-red-50/40 dark:from-red-950/40 dark:to-red-900/20 shadow-lg ring-1 ring-red-300/30 dark:ring-red-700/30"
                            : "border-gray-200/80 dark:border-gray-700/80 hover:border-red-200/60 dark:hover:border-red-800/40 hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                        }`}
                        onClick={() => handleSelectAddress(address.id)}
                        whileHover={{ scale: 1.005, y: -2 }}
                        whileTap={{ scale: 0.998 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded">
                                <Home className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <h3 className="font-semibold">
                                {address.title ||
                                  t("checkout.addressTitle") ||
                                  "Address"}
                              </h3>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300">
                                  <Sparkles className="h-3 w-3" />
                                  {t("checkout.setAsDefault") || "Default"}
                                </span>
                              )}
                              {selectedAddressId === address.id && (
                                <motion.div
                                  className="ml-auto flex items-center gap-1 text-red-500"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeOut",
                                  }}
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </motion.div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {(address.firstName || address.lastName) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-4 w-4" />
                                  <span>
                                    {[address.firstName, address.lastName]
                                      .filter(Boolean)
                                      .join(" ") || "-"}
                                  </span>
                                </div>
                              )}
                              {address.phoneNumber && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <span>{address.phoneNumber}</span>
                                </div>
                              )}
                              <div className="flex items-start gap-2 text-sm mt-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>
                                  {address.streetAddress1}
                                  {address.streetAddress2 &&
                                    `, ${address.streetAddress2}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  {address.cityName}, {address.provinceName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{address.postalCode}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                              disabled={deletingAddressId === address.id}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 space-y-6 bg-linear-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold">
                      {editingAddress
                        ? t("checkout.editAddress") || "Edit Address"
                        : t("checkout.addNewAddress") || "Add New Address"}
                    </h2>
                  </div>

                  {/* Required Fields Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      {t("checkout.requiredInformation") ||
                        "Required Information"}
                    </h3>
	                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
	                      <div>
	                        <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
	                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
	                          {t("checkout.province") || "Province"} *
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
	                                setValue("cityId", 0);
	                              }}
	                              placeholder={
	                                t("checkout.selectProvince") ||
	                                "Select Province"
	                              }
	                              searchPlaceholder={
	                                t("checkout.searchProvince") ||
	                                "Search provinces..."
	                              }
	                              emptyMessage={
	                                t("checkout.noProvincesFound") ||
	                                "No provinces found"
	                              }
	                              error={!!formErrors.provinceId}
	                              className={
	                                formErrors.provinceId ? "border-red-500" : ""
	                              }
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
                        <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.city") || "City"} *
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
	                              placeholder={t("checkout.selectCity") || "Select City"}
	                              searchPlaceholder={
	                                t("checkout.searchCity") || "Search cities..."
	                              }
	                              emptyMessage={
	                                t("checkout.noCitiesFound") || "No cities found"
	                              }
	                              disabled={provinceId <= 0}
	                              error={!!formErrors.cityId}
	                              className={formErrors.cityId ? "border-red-500" : ""}
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
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.streetAddress") || "Address Description"}{" "}
                          *
                        </label>
	                        <Input
	                          {...register("streetAddress1")}
	                          placeholder={
	                            t("checkout.streetAddressPlaceholder") ||
	                            "Enter address description"
	                          }
	                          className={
	                            formErrors.streetAddress1 ? "border-red-500" : ""
	                          }
	                        />
	                        {formErrors.streetAddress1?.message && (
	                          <p className="text-xs text-red-500 mt-1">
	                            {String(formErrors.streetAddress1.message)}
	                          </p>
	                        )}
	                      </div>

                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.postalCode") || "Postal Code"} *
                        </label>
	                        <Controller
	                          name="postalCode"
	                          control={control}
	                          render={({ field }) => (
	                            <Input
	                              {...field}
	                              value={field.value ?? ""}
	                              onChange={(e) =>
	                                field.onChange(toEnglishNumbers(e.target.value))
	                              }
	                              placeholder={
	                                t("checkout.postalCodePlaceholder") ||
	                                "Enter postal code"
	                              }
	                              className={
	                                formErrors.postalCode ? "border-red-500" : ""
	                              }
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
                  <div className="space-y-3 pt-2 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      {t("checkout.optionalInformation") ||
                        "Optional Information"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.addressTitle") || "Address Title"}
                        </label>
	                        <Input
	                          {...register("title")}
	                          placeholder={
	                            t("checkout.addressTitlePlaceholder") ||
	                            "e.g., Home, Work, Office"
	                          }
	                        />
	                      </div>

                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.firstName") || "First Name"}
                        </label>
	                        <Input
	                          {...register("firstName")}
	                          placeholder={
	                            t("checkout.firstNamePlaceholder") ||
	                            "Enter first name"
	                          }
	                        />
	                      </div>

                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.lastName") || "Last Name"}
                        </label>
	                        <Input
	                          {...register("lastName")}
	                          placeholder={
	                            t("checkout.lastNamePlaceholder") ||
	                            "Enter last name"
	                          }
	                        />
	                      </div>

                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.phoneNumber") || "Phone Number"}
                        </label>
	                        <Controller
	                          name="phoneNumber"
	                          control={control}
	                          render={({ field }) => (
	                            <Input
	                              {...field}
	                              type="tel"
	                              value={field.value ?? ""}
	                              onChange={(e) =>
	                                field.onChange(toEnglishNumbers(e.target.value))
	                              }
	                              placeholder={
	                                t("checkout.phoneNumberPlaceholder") ||
	                                "Enter phone number"
	                              }
	                              className={
	                                formErrors.phoneNumber ? "border-red-500" : ""
	                              }
	                            />
	                          )}
	                        />
	                        {formErrors.phoneNumber?.message && (
	                          <p className="text-xs text-red-500 mt-1">
	                            {String(formErrors.phoneNumber.message)}
	                          </p>
	                        )}
	                      </div>

                      <div>
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.alternativePhoneNumber") ||
                            "Alternative Phone Number"}
                        </label>
	                        <Controller
	                          name="alternativePhoneNumber"
	                          control={control}
	                          render={({ field }) => (
	                            <Input
	                              {...field}
	                              type="tel"
	                              value={field.value ?? ""}
	                              onChange={(e) =>
	                                field.onChange(toEnglishNumbers(e.target.value))
	                              }
	                              placeholder={
	                                t("checkout.alternativePhoneNumberPlaceholder") ||
	                                "Optional"
	                              }
	                            />
	                          )}
	                        />
	                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1">
                          {t("checkout.streetAddress2") || "Street Address 2"}
                        </label>
	                        <Input
	                          {...register("streetAddress2")}
	                          placeholder={
	                            t("checkout.streetAddress2Placeholder") ||
	                            "Apartment, suite, etc."
	                          }
	                        />
	                      </div>

                      <div className="md:col-span-2">
                        <label className=" text-xs font-medium mb-1 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("checkout.additionalDetails") ||
                            "Additional Details"}
                        </label>
	                        <textarea
	                          {...register("additionalDetails")}
	                          placeholder={
	                            t("checkout.additionalDetailsPlaceholder") ||
	                            "Landmarks, directions, etc."
	                          }
	                          rows={2}
	                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
	                        />
	                      </div>

	                      <div className="md:col-span-2">
	                        <label className="flex items-center gap-2">
	                          <Controller
	                            name="isDefault"
	                            control={control}
	                            render={({ field }) => (
	                              <input
	                                type="checkbox"
	                                checked={!!field.value}
	                                onChange={(e) =>
	                                  field.onChange(e.target.checked)
	                                }
	                                className="rounded"
	                              />
	                            )}
	                          />
	                          <span className="text-xs">
	                            {t("checkout.setAsDefault") ||
	                              "Set as Default Address"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSaveAddress}
                      disabled={saving}
                      className="flex-1 bg-linear-to-rfrom-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                      size="sm"
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {t("common.loading") || "Loading..."}
                        </>
                      ) : (
                        <>
                          <Save
                            className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          />
                          {t("checkout.saveAddress") || "Save Address"}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        reset(DEFAULT_ADDRESS_FORM_VALUES);
                        setCities([]);
                      }}
                    >
                      {t("checkout.cancel") || "Cancel"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {addresses.length === 0 && !showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-8 text-center bg-linear-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
                >
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-4">
                    <MapPin className="h-16 w-16 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {t("checkout.noAddresses") || "No addresses found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("checkout.noAddressesMessage") ||
                      "Add a new address to continue"}
                  </p>
                  <Button
                    onClick={() => {
                      reset(DEFAULT_ADDRESS_FORM_VALUES);
                      setCities([]);
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="bg-linear-to-rfrom-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                  >
                    <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("checkout.addNewAddress") || "Add New Address"}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Right Column - Order Summary & Continue Button */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <div className="border rounded-lg shadow-lg bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 space-y-4">
                  {cart && cart.items.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">
                          {t("cart.orderSummary") || "Order Summary"}
                        </h2>
                      </div>

                      {/* Price of Items */}
                      <div
                        className={`flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {effectiveLangCode === "fa" ? (
                          <>
                            <span className="font-semibold">
                              {formatPrice(
                                cart.subtotal,
                                cart.currencySymbol,
                                effectiveLangCode,
                                effectiveLangCode === "fa"
                              )}
                            </span>
                            <span className="text-muted-foreground flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              {t("cart.priceOfItems") || "Price of items"} (
                              {cart.itemCount})
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              {t("cart.priceOfItems") || "Price of items"} (
                              {cart.itemCount})
                            </span>
                            <span className="font-semibold">
                              {formatPrice(
                                cart.subtotal,
                                cart.currencySymbol,
                                effectiveLangCode                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Your Profit (Discount) */}
                      {cart.totalDiscount > 0 && (
                        <div
                          className={`flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          {effectiveLangCode === "fa" ? (
                            <>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                -
                                {formatPrice(
                                  cart.totalDiscount,
                                  cart.currencySymbol,
                                  effectiveLangCode,
                                  effectiveLangCode === "fa"
                                )}
                              </span>
                              <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                {t("cart.yourProfit") ||
                                  "Your profit from purchase"}{" "}
                                (
                                {effectiveLangCode === "fa"
                                  ? toPersianNumbers(
                                      Math.round(
                                        (cart.totalDiscount / cart.subtotal) *
                                          100
                                      )
                                    )
                                  : Math.round(
                                      (cart.totalDiscount / cart.subtotal) * 100
                                    )}
                                %)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                {t("cart.yourProfit") ||
                                  "Your profit from purchase"}{" "}
                                (
                                {currentLanguage == "fa"
                                  ? toPersianNumbers(
                                      Math.round(
                                        (cart.totalDiscount / cart.subtotal) *
                                          100
                                      )
                                    )
                                  : Math.round(
                                      (cart.totalDiscount / cart.subtotal) * 100
                                    )}
                                %)
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                -
                                {formatPrice(
                                  cart.totalDiscount,
                                  cart.currencySymbol,
                                  effectiveLangCode,
                                  currentLanguage == "fa"
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Cart Total */}
                      <div
                        className={`flex justify-between items-center pt-4 border-t-2 border-gray-200 dark:border-gray-700 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {effectiveLangCode === "fa" ? (
                          <>
                            <span className="font-bold text-lg text-red-600 dark:text-red-400">
                              {formatPrice(
                                cart.total,
                                cart.currencySymbol,
                                effectiveLangCode,
                                effectiveLangCode === "fa"
                              )}
                            </span>
                            <span className="text-foreground font-bold flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-red-500" />
                              {t("cart.cartTotal") || "Cart Total"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-foreground font-bold flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-red-500" />
                              {t("cart.cartTotal") || "Cart Total"}
                            </span>
                            <span className="font-bold text-lg text-red-600 dark:text-red-400">
                              {formatPrice(
                                cart.total,
                                cart.currencySymbol,
                                effectiveLangCode,
                                currentLanguage == "fa"
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t dark:border-gray-700">
                    <Button
                      onClick={handleContinue}
                      disabled={!selectedAddressId && !showAddressForm}
                      className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200"
                      size="lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {t("checkout.continue") || "Continue"}
                        <ArrowRight
                          className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`}
                        />
                      </span>
                    </Button>
                  </div>

                  {/* Info Note */}
                  {cart && cart.items.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {t("cart.paymentNote") ||
                        "The cost of this order has not yet been paid, and in case of out of stock, items will be removed from the cart."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
