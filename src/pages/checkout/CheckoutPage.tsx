import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, MapPinHouse, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import useCartStore from '@/stores/cartStore';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getCart, setCartDeliveryMethod } from '@/utils/cartApi';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { CheckoutAddressList } from './sections/CheckoutAddressList';
import { CheckoutAddressForm } from './sections/CheckoutAddressForm';
import { CheckoutSummary } from './sections/CheckoutSummary';
import { CheckoutDeliveryMethods } from './sections/CheckoutDeliveryMethods';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((state) => state.lang);
  const dir = useLangStore((state) => state.dir);
  const { cart, setCart } = useCartStore();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { error: showErrorToast, warning: showWarningToast } = useToast();
  const { t } = useTranslation();
  const [isValidatingCart, setIsValidatingCart] = useState(true);
  const [applyingDeliveryMethodId, setApplyingDeliveryMethodId] = useState<number | null>(null);

  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';
  const cartScope = isAuthenticated ? `user:${user?.id ?? 'authenticated'}` : 'guest';

  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    const validateCartEntry = async () => {
      try {
        const latestCart = await queryClient.fetchQuery({
          queryKey: ['cart', effectiveLangCode, cartScope],
          queryFn: () => getCart(effectiveLangCode),
        });

        if (!isMounted) return;
        setCart(latestCart);

        if (!latestCart.items.length) {
          showWarningToast(t('cart.emptyCart') || 'Your cart is empty');
          navigate(localizedPath('/cart'), { replace: true });
        }
      } catch (entryError) {
        if (!isMounted) return;
        showErrorToast(t('common.retry') || 'Failed to load your cart. Please try again.');
        navigate(localizedPath('/cart'), { replace: true });
      } finally {
        if (isMounted) {
          setIsValidatingCart(false);
        }
      }
    };

    validateCartEntry();

    return () => {
      isMounted = false;
    };
  }, [
    authLoading,
    cartScope,
    effectiveLangCode,
    localizedPath,
    navigate,
    queryClient,
    setCart,
    showErrorToast,
    showWarningToast,
  ]);

  const {
    addresses,
    provinces,
    cities,
    deliveryMethods,
    selectedAddressId,
    selectedDeliveryMethodId,
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
    selectDeliveryMethod,
    continueToPayment,
    toggleOptionalFields,
  } = useCheckoutData({
    languageCode: effectiveLangCode,
    t,
    appliedDeliveryMethodId: cart?.appliedDeliveryMethodId ?? null,
  });

  const continueDisabled = applyingDeliveryMethodId !== null || saving;

  const handleDeliveryMethodSelect = async (deliveryMethodId: number) => {
    if (applyingDeliveryMethodId !== null) {
      return;
    }

    if (cart?.appliedDeliveryMethodId === deliveryMethodId) {
      selectDeliveryMethod(deliveryMethodId);
      return;
    }

    setApplyingDeliveryMethodId(deliveryMethodId);

    try {
      const updatedCart = await setCartDeliveryMethod(deliveryMethodId, effectiveLangCode);
      setCart(updatedCart);
      queryClient.setQueryData(['cart', effectiveLangCode, cartScope], updatedCart);
      selectDeliveryMethod(updatedCart.appliedDeliveryMethodId ?? deliveryMethodId);
    } catch (deliveryMethodError) {
      console.error('Failed to update delivery method:', deliveryMethodError);
      showErrorToast(
        deliveryMethodError instanceof Error
          ? deliveryMethodError.message
          : t('checkout.deliveryMethodUpdateError') || 'Failed to update delivery method',
      );
    } finally {
      setApplyingDeliveryMethodId(null);
    }
  };

  const handleContinue = async () => {
    if (applyingDeliveryMethodId !== null) {
      return;
    }

    if (!addresses.length || !selectedAddressId) {
      showErrorToast(t('checkout.addressRequired') || 'Address is required');
      return;
    }

    if (!selectedDeliveryMethodId) {
      showErrorToast(t('checkout.deliveryMethodRequired') || 'Please select a delivery method');
      return;
    }

    const canContinue = await continueToPayment();
    if (!canContinue) {
      return;
    }

    try {
      let latestCart = await queryClient.fetchQuery({
        queryKey: ['cart', effectiveLangCode, cartScope],
        queryFn: () => getCart(effectiveLangCode),
      });

      if (!latestCart.items.length) {
        setCart(latestCart);
        showWarningToast(t('cart.emptyCart') || 'Your cart is empty');
        navigate(localizedPath('/cart'));
        return;
      }

      if (latestCart.appliedDeliveryMethodId !== selectedDeliveryMethodId) {
        latestCart = await setCartDeliveryMethod(selectedDeliveryMethodId, effectiveLangCode);
      }

      setCart(latestCart);
      queryClient.setQueryData(['cart', effectiveLangCode, cartScope], latestCart);

      navigate(localizedPath('/payment'), {
        state: { deliveryMethodId: selectedDeliveryMethodId },
      });
    } catch (error) {
      console.error('Failed to refresh cart before continuing to payment:', error);
      showErrorToast(t('common.retry') || 'Failed to refresh cart. Please try again.');
    }
  };

  const showMobileContinueBar =
    !loading && !error && !isValidatingCart && Boolean(cart && cart.items.length > 0);

  return (
    <main className="page-container page-section pb-32 lg:pb-12">
      <div className="space-y-6">
        <CheckoutStepper currentStep={2} />

        <section className="product-detail-soft-panel flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-color-for-layer-on-body text-first">
              <MapPinHouse className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-s-bold first-text-color">
                {t('checkout.title') || 'Checkout'}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm first-text-color-for-paragraph-low">
                <ShoppingBag className="h-4 w-4 text-first" strokeWidth={1.5} />
                <span>{t('checkout.address') || 'Address'}</span>
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate(localizedPath('/cart'))}
            className="product-detail-focus gap-2 border border-[color-mix(in_srgb,var(--first-text-color-svg)_14%,transparent)] bg-color-for-layer-on-body first-text-color hover:bg-first hover:text-white"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('common.back') || 'Back'}
          </Button>
        </section>

        {loading || isValidatingCart ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start xl:gap-6">
            <div className="product-detail-panel space-y-4 p-4 sm:p-5 lg:col-span-8">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
            <div className="product-detail-panel space-y-4 p-4 sm:p-5 lg:col-span-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="product-detail-panel relative overflow-hidden px-4 py-12 text-center sm:p-14">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
            />
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="product-detail-soft-panel flex h-20 w-20 items-center justify-center">
                <AlertCircle className="h-10 w-10 text-first" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-s-medium first-text-color">{error}</p>
              <Button
                onClick={retryLoad}
                className="h-11 rounded-lg bg-first px-5 text-white hover:bg-first-600"
              >
                {t('common.retry') || 'Retry'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start xl:gap-6">
            <div className="space-y-5 lg:col-span-8">
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

              <CheckoutDeliveryMethods
                deliveryMethods={deliveryMethods}
                selectedDeliveryMethodId={selectedDeliveryMethodId}
                applyingDeliveryMethodId={applyingDeliveryMethodId}
                languageCode={effectiveLangCode}
                t={t}
                onSelectDeliveryMethod={handleDeliveryMethodSelect}
              />
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="lg:sticky lg:top-24">
                <CheckoutSummary
                  cart={cart}
                  languageCode={effectiveLangCode}
                  isRTL={isRTL}
                  t={t}
                  onContinue={handleContinue}
                  continueDisabled={continueDisabled}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showMobileContinueBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--first-text-color-svg)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg-color-for-layer-on-body)_94%,transparent)] px-3 pt-3 shadow-[0_-18px_34px_-28px_rgba(20,29,38,0.85)] backdrop-blur lg:hidden">
          <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
            <div
              className={`mb-3 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-xs first-text-color-for-paragraph-low">
                {t('cart.cartTotal') || 'Cart Total'}
              </span>
              <span className="text-lg font-s-bold first-text-color">
                <PriceDisplay amount={cart?.total ?? 0} languageCode={effectiveLangCode} />
              </span>
            </div>
            <Button
              onClick={handleContinue}
              disabled={continueDisabled}
              className="h-12 w-full gap-2 rounded-lg bg-first font-s-bold text-white hover:bg-first-600"
              size="lg"
            >
              {t('checkout.continue') || 'Continue'}
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
