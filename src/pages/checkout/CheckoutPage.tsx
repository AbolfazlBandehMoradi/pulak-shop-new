import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import useCartStore from '@/stores/cartStore';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';
import { useCheckoutData } from './hooks/useCheckoutData';
import { CheckoutAddressList } from './sections/CheckoutAddressList';
import { CheckoutAddressForm } from './sections/CheckoutAddressForm';
import { CheckoutSummary } from './sections/CheckoutSummary';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((state) => state.lang);
  const dir = useLangStore((state) => state.dir);
  const { cart } = useCartStore();
  const { t } = useTranslation();

  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';

  const {
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
  } = useCheckoutData({
    languageCode: effectiveLangCode,
    t,
  });

  const handleContinue = async () => {
    const canContinue = await continueToPayment();
    if (canContinue) {
      navigate(localizedPath('/payment'));
    }
  };

  return (
    <main className="mx-auto mt-20 lg:mt-8 px-4 sm:container">
      <CheckoutStepper currentStep={2} />
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="font-s-bold first-text-color text-xl">{t('checkout.title') || 'Checkout'}</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(localizedPath('/cart'))}
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
            <Button onClick={retryLoad} className="bg-red-600 hover:bg-red-700">
              {t('common.retry') || 'Retry'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {showAddressForm ? (
              <CheckoutAddressForm
                form={form}
                provinces={provinces}
                cities={cities}
                provinceId={provinceId}
                editingAddress={editingAddress}
                saving={saving}
                showOptionalFields={showOptionalFields}
                isRTL={isRTL}
                t={t}
                onToggleOptionalFields={toggleOptionalFields}
                onSave={saveAddressForm}
                onCancel={closeAddressForm}
              />
            ) : (
              <CheckoutAddressList
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                t={t}
                onAddAddress={openCreateAddressForm}
                onSelectAddress={selectAddress}
                onEditAddress={openEditAddressForm}
                onDeleteAddress={deleteAddressById}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-25">
              <CheckoutSummary
                cart={cart}
                languageCode={effectiveLangCode}
                isRTL={isRTL}
                t={t}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
