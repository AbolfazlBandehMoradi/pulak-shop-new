import { AnimatePresence, motion } from 'framer-motion';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { ChevronDown, Loader2, MapPinHouse, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toEnglishNumbers } from '@/utils/numberFormat';
import type { City, Province, SaveAddressRequest, UserAddress } from '@/utils/checkoutApi';

type TranslateFn = (key: string) => string | undefined;

interface CheckoutAddressFormProps {
  form: UseFormReturn<SaveAddressRequest>;
  provinces: Province[];
  cities: City[];
  provinceId: number;
  editingAddress: UserAddress | null;
  saving: boolean;
  showOptionalFields: boolean;
  isRTL: boolean;
  t: TranslateFn;
  onToggleOptionalFields: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CheckoutAddressForm({
  form,
  provinces,
  cities,
  provinceId,
  editingAddress,
  saving,
  showOptionalFields,
  isRTL,
  t,
  onToggleOptionalFields,
  onSave,
  onCancel,
}: CheckoutAddressFormProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = form;

  return (
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
            <label className="text-xs mb-2 flex items-center first-text-color-for-paragraph">
              <span className="me-1">{t('checkout.province') || 'Province'}</span>(
              <span className="first-text-color-red">{t('checkout.required') || 'required'})</span>
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
                    setValue('cityId', 0, { shouldDirty: true });
                  }}
                  placeholder={t('checkout.selectProvince') || 'Select Province'}
                  searchPlaceholder={t('checkout.searchProvince') || 'Search provinces...'}
                  emptyMessage={t('checkout.noProvincesFound') || 'No provinces found'}
                  error={!!errors.provinceId}
                  className={errors.provinceId ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.provinceId?.message && (
              <p className="text-xs text-red-500 mt-1">{String(errors.provinceId.message)}</p>
            )}
          </div>

          <div>
            <label className="text-xs mb-2 flex items-center first-text-color">
              <span className="me-1">{t('checkout.city') || 'city'}</span>(
              <span className="first-text-color-red">{t('checkout.required') || 'required'})</span>
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
                  error={!!errors.cityId}
                  className={errors.cityId ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.cityId?.message && (
              <p className="text-xs text-red-500 mt-1">{String(errors.cityId.message)}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
              <span className="me-1">{t('checkout.streetAddress') || 'Address Description'}</span>(
              <span className="first-text-color-red">{t('checkout.required') || 'required'}</span>)
            </label>

            <textarea
              {...register('streetAddress1')}
              rows={3}
              placeholder={t('checkout.streetAddressPlaceholder') || 'Enter address description'}
              className={`w-full rounded-md border border-gray-300 dark:border-gray-500 bg-color-for-layer-sec px-3 py-2 text-sm resize-none first-text-color-for-paragraph transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.streetAddress1 ? 'border-red-500' : 'border-input'
              }`}
            />

            {errors.streetAddress1?.message && (
              <p className="text-xs text-red-500 mt-1">{String(errors.streetAddress1.message)}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs mb-2 flex items-center first-text-color-for-paragraph">
              <span className="me-1">{t('checkout.postalCode') || 'Postal Code'}</span>(
              <span className="first-text-color-red">{t('checkout.required') || 'required'})</span>
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
                  onChange={(event) => {
                    const onlyNumbers = toEnglishNumbers(event.target.value).replace(/\D/g, '');
                    field.onChange(onlyNumbers);
                  }}
                  placeholder={t('checkout.postalCodePlaceholder') || 'Enter postal code'}
                  className={errors.postalCode ? 'border-red-500' : 'text-right'}
                />
              )}
            />
            {errors.postalCode?.message && (
              <p className="text-xs text-red-500 mt-1">{String(errors.postalCode.message)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 ">
        <button
          type="button"
          onClick={onToggleOptionalFields}
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
            <ChevronDown className="h-4 w-4 first-text-color-for-paragraph-low" />
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
                <div>
                  <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                    {t('checkout.addressTitle') || 'Address Title'}
                  </label>
                  <Input
                    {...register('title')}
                    placeholder={
                      t('checkout.addressTitlePlaceholder') || 'e.g., Home, Work, Office'
                    }
                  />
                </div>

                <div>
                  <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                    {t('checkout.firstName') || 'First Name'}
                  </label>
                  <Input
                    {...register('firstName')}
                    placeholder={t('checkout.firstNamePlaceholder') || 'Enter first name'}
                  />
                </div>

                <div>
                  <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                    {t('checkout.lastName') || 'Last Name'}
                  </label>
                  <Input
                    {...register('lastName')}
                    placeholder={t('checkout.lastNamePlaceholder') || 'Enter last name'}
                  />
                </div>

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
                        onChange={(event) => field.onChange(toEnglishNumbers(event.target.value))}
                        placeholder={t('checkout.phoneNumberPlaceholder') || 'Enter phone number'}
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                    {t('checkout.alternativePhoneNumber') || 'Alternative Phone Number'}
                  </label>
                  <Controller
                    name="alternativePhoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(toEnglishNumbers(event.target.value))}
                        placeholder={t('checkout.alternativePhoneNumberPlaceholder') || 'Optional'}
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs mt-4 mb-2 flex items-center first-text-color-for-paragraph">
                    {t('checkout.streetAddress2') || 'Street Address 2'}
                  </label>
                  <Input
                    {...register('streetAddress2')}
                    placeholder={
                      t('checkout.streetAddress2Placeholder') || 'Apartment, suite, etc.'
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
          onClick={onSave}
          disabled={saving}
          className="group relative w-full items-center rounded-lg bg-secound px-4 py-2 text-white"
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
          onClick={onCancel}
        >
          {t('checkout.cancel') || 'Cancel'}
        </Button>
      </div>
    </motion.div>
  );
}
