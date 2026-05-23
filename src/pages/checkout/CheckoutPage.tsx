import { AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import useCartStore from '@/stores/cartStore';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getCart } from '@/utils/cartApi';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { CheckoutAddressList } from './sections/CheckoutAddressList';
import { CheckoutAddressForm } from './sections/CheckoutAddressForm';
import { CheckoutSummary } from './sections/CheckoutSummary';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((state) => state.lang);
  const dir = useLangStore((state) => state.dir);
  const { cart, setCart } = useCartStore();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { error: showErrorToast, warning: showWarningToast } = useToast();
  const { t } = useTranslation();

  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';
  const cartScope = isAuthenticated ? `user:${user?.id ?? 'authenticated'}` : 'guest';

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
    if (!canContinue) {
      return;
    }

    try {
      const latestCart = await queryClient.fetchQuery({
        queryKey: ['cart', effectiveLangCode, cartScope],
        queryFn: () => getCart(effectiveLangCode),
      });
      setCart(latestCart);

      if (!latestCart.items.length) {
        showWarningToast(t('cart.emptyCart') || 'Your cart is empty');
        navigate(localizedPath('/cart'));
        return;
      }

      navigate(localizedPath('/payment'));
    } catch (error) {
      console.error('Failed to refresh cart before continuing to payment:', error);
      showErrorToast(t('common.retry') || 'Failed to refresh cart. Please try again.');
    }
  };

  const showMobileContinueBar = !loading && !error && Boolean(cart && cart.items.length > 0);

  return (
    <main className="mx-auto mt-8 px-4 pb-28 lg:pb-8 sm:container">
      <CheckoutStepper currentStep={2} />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-s-bold first-text-color text-xl">{t('checkout.title') || 'Checkout'}</h1>
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

          <div className="hidden lg:col-span-1 lg:block">
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

      {showMobileContinueBar && (
        <div className="fixed inset-x-0 bottom-0 z-[40] border-t border-gray-300/50 bg-color-for-layer-on-body shadow-dark-sm lg:hidden">
          <div
            className="mx-auto w-full max-w-3xl px-4 pt-3"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
          >
            <Button
              onClick={handleContinue}
              className="w-full font-s-sbold bg-first text-white hover:bg-first-600"
              size="lg"
            >
              <span className="flex items-center justify-center gap-2">
                {t('checkout.continue') || 'Continue'}
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </span>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
