import { useState, useEffect, useCallback, useRef, type ChangeEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  ReceiptText,
  ArrowRight,
  ArrowLeft,
  Landmark,
  Copy,
  ImagePlus,
  X,
  Loader2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getCart, setCartDeliveryMethod, type Cart } from '@/utils/cartApi';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { validateCoupon, type Coupon } from '@/utils/couponApi';
import { getActivePaymentGateways, type ActivePaymentGateway } from '@/utils/paymentGatewayApi';
import {
  DEFAULT_CARD_TO_CARD_FIELDS,
  getCardToCardSettings,
  submitCardToCardPayment,
  uploadCardToCardReceiptImage,
  type CardToCardSettings,
  type CardToCardSubmitRequest,
} from '@/utils/cardToCardApi';
import { requestZibalPayment } from '@/utils/zibalApi';
import { requestZarinPalPayment } from '@/utils/zarinpalApi';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import useCartStore from '@/stores/cartStore';
import { useToast } from '@/context/ToastContext';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';
import { localizeDigits } from '@/utils/numberFormat';
import getImageUrl from '@/utils/getImageUrl';
import type { MediaFile } from '@/utils/shopApi';
import { cn } from '@/utils/cn';

type PaymentMethod = 'online' | 'wallet' | 'cardToCard';

const EMPTY_CART_TOAST_DEDUP_MS = 1500;
let lastEmptyCartToastAt = 0;

function getDeliveryMethodIdFromLocationState(state: unknown): number | null {
  if (!state || typeof state !== 'object' || !('deliveryMethodId' in state)) {
    return null;
  }

  const value = (state as { deliveryMethodId?: unknown }).deliveryMethodId;
  const deliveryMethodId = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(deliveryMethodId) && deliveryMethodId > 0 ? deliveryMethodId : null;
}

function normalizeCardDigits(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/[\u06F0-\u06F9\u0660-\u0669]/g, (digit) => {
      const code = digit.charCodeAt(0);
      if (code >= 0x06f0 && code <= 0x06f9) {
        return String(code - 0x06f0);
      }
      return String(code - 0x0660);
    })
    .replace(/\D/g, '');
}

function formatCardNumber(value?: string | null, languageCode = 'en'): string {
  const digits = normalizeCardDigits(value).slice(0, 16);
  const grouped = digits.replace(/(.{4})(?=.)/g, '$1 ');
  return localizeDigits(grouped, languageCode);
}

interface SummaryLineProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  highlight?: boolean;
}

function SummaryLine({ label, value, icon, highlight = false }: SummaryLineProps) {
  return (
    <div className="product-detail-divider flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <span
        className={cn(
          'flex min-w-0 items-center gap-2',
          highlight ? 'font-s-bold first-text-color' : 'text-sm first-text-color-for-paragraph',
        )}
      >
        {icon}
        <span className="min-w-0">{label}</span>
      </span>
      <span
        className={
          highlight
            ? 'text-lg font-s-bold first-text-color'
            : 'text-sm font-s-medium first-text-color'
        }
      >
        {value}
      </span>
    </div>
  );
}

interface PaymentFieldLabelProps {
  children: ReactNode;
  required?: boolean;
}

function PaymentFieldLabel({ children, required = false }: PaymentFieldLabelProps) {
  return (
    <label className="flex items-center gap-1 text-sm font-s-medium first-text-color">
      <span>{children}</span>
      {required && (
        <span aria-hidden="true" className="text-red-500">
          *
        </span>
      )}
    </label>
  );
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const globalCart = useCartStore((state) => state.cart);
  const setGlobalCart = useCartStore((state) => state.setCart);
  const {
    error: showErrorToast,
    warning: showWarningToast,
    success: showSuccessToast,
  } = useToast();

  // Determine language code from global language store
  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';
  const cartScope = isAuthenticated ? `user:${user?.id ?? 'authenticated'}` : 'guest';
  const checkoutDeliveryMethodId =
    getDeliveryMethodIdFromLocationState(location.state) ?? globalCart?.appliedDeliveryMethodId;
  const emptyCartMessage = t('cart.emptyCart') || 'Your cart is empty';
  const sessionExpiredMessage =
    t('payment.sessionExpired') || 'Your session has expired. Please sign in again.';
  const networkErrorMessage =
    t('payment.networkError') || 'Network error. Please check your connection and retry.';
  const loadPaymentErrorMessage =
    t('payment.loadError') || 'Failed to load payment data. Please try again.';
  const gatewayLoadErrorMessage =
    t('payment.gatewayLoadError') || 'Failed to load payment gateways. Please try again.';
  const cardToCardSettingsLoadErrorMessage =
    t('payment.cardToCardSettingsLoadError') ||
    'Failed to load card-to-card settings. Manual transfer may be unavailable.';
  const cartRefreshErrorMessage =
    t('payment.cartRefreshError') || 'Failed to refresh cart. Please try again.';
  const selectGatewayValidationMessage =
    t('payment.selectGatewayValidation') || 'Please select a payment gateway to continue.';
  const invalidGatewayResponseMessage =
    t('payment.invalidGatewayResponse') ||
    'Payment gateway returned an invalid response. Please try again.';
  const paymentRequestErrorMessage =
    t('payment.requestError') || 'Payment request failed. Please try again.';
  const receiptUploadErrorMessage =
    t('payment.receiptUploadError') || 'Failed to upload receipt image.';
  const cardToCardValidationErrorMessage =
    t('payment.cardToCardRequiredFieldsValidation', {
      defaultValue: 'Please complete the required card-to-card fields.',
    }) || 'Please complete the required card-to-card fields.';
  const cardToCardSubmitErrorMessage =
    t('payment.cardToCardSubmitError') || 'Failed to submit receipt.';
  const cardToCardSubmittedMessage =
    t('payment.cardToCardSubmitted') || 'Your receipt has been submitted.';

  const [cart, setCartData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [gateways, setGateways] = useState<ActivePaymentGateway[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(null);
  const [cardToCardSettings, setCardToCardSettings] = useState<CardToCardSettings | null>(null);
  const [cardToCardSettingsLoading, setCardToCardSettingsLoading] = useState(false);
  const [transactionReferenceId, setTransactionReferenceId] = useState('');
  const [sourceCardNumber, setSourceCardNumber] = useState('');
  const [sourceCardOwnerName, setSourceCardOwnerName] = useState('');
  const [receiptImage, setReceiptImage] = useState<MediaFile | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const hasRedirectedToCartRef = useRef(false);

  const destinationCardNumber = normalizeCardDigits(cardToCardSettings?.cardToCardNumber ?? '');
  const accountHolder = cardToCardSettings?.cardToCardAccountHolder.trim() ?? '';
  const showOnlinePayment = !gatewaysLoading && gateways.length > 0;
  const cardToCardEnabled =
    cardToCardSettings?.cardToCardEnabled === true && destinationCardNumber.length === 16;
  const cardToCardFields = cardToCardSettings?.cardToCardFields ?? DEFAULT_CARD_TO_CARD_FIELDS;
  const transactionReferenceField = cardToCardFields.transactionReferenceId;
  const sourceCardNumberField = cardToCardFields.sourceCardNumber;
  const sourceCardOwnerNameField = cardToCardFields.sourceCardOwnerName;
  const receiptImageField = cardToCardFields.receiptImage;
  const sourceCardDigits = normalizeCardDigits(sourceCardNumber);
  const sourceCardOwnerNameValue = sourceCardOwnerName.trim();
  const receiptImageUrl = receiptImage
    ? getImageUrl(receiptImage.thumbnailPath || receiptImage.filePath)
    : null;
  const isTransactionReferenceValid =
    !transactionReferenceField.show ||
    !transactionReferenceField.required ||
    transactionReferenceId.trim().length > 0;
  const isSourceCardNumberValid =
    !sourceCardNumberField.show ||
    sourceCardDigits.length === 16 ||
    (!sourceCardNumberField.required && sourceCardDigits.length === 0);
  const isSourceCardOwnerNameValid =
    !sourceCardOwnerNameField.show ||
    !sourceCardOwnerNameField.required ||
    sourceCardOwnerNameValue.length > 0;
  const isReceiptImageValid =
    !receiptImageField.show || !receiptImageField.required || Boolean(receiptImage?.id);
  const canSubmitCardToCard =
    cardToCardEnabled &&
    isTransactionReferenceValid &&
    isSourceCardNumberValid &&
    isSourceCardOwnerNameValid &&
    isReceiptImageValid &&
    !receiptUploading;
  const noPaymentMethodsAvailable =
    !gatewaysLoading && !cardToCardSettingsLoading && !showOnlinePayment && !cardToCardEnabled;

  // Keep redirect behavior aligned with protected route pattern
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(localizedPath('/auth'), {
        replace: true,
        state: { redirectUrl: location.pathname + location.search },
      });
    }
  }, [authLoading, isAuthenticated, location.pathname, location.search, localizedPath, navigate]);

  const getApiErrorMessage = useCallback(
    (err: unknown, fallback: string) => {
      if (!(err instanceof Error) || !err.message.trim()) {
        return fallback;
      }

      if (err.message === 'AUTH_EXPIRED') {
        return sessionExpiredMessage;
      }

      const normalized = err.message.toLowerCase();
      if (normalized.includes('network') || normalized.includes('failed to fetch')) {
        return networkErrorMessage;
      }

      return err.message;
    },
    [networkErrorMessage, sessionExpiredMessage],
  );

  const redirectToCartBecauseEmpty = useCallback(
    (replace = true) => {
      if (hasRedirectedToCartRef.current) {
        return;
      }

      hasRedirectedToCartRef.current = true;
      const now = Date.now();
      if (now - lastEmptyCartToastAt > EMPTY_CART_TOAST_DEDUP_MS) {
        showWarningToast(emptyCartMessage);
        lastEmptyCartToastAt = now;
      }
      navigate(localizedPath('/cart'), { replace });
    },
    [emptyCartMessage, localizedPath, navigate, showWarningToast],
  );

  const ensureDeliveryMethodOnCart = useCallback(
    async (cartData: Cart): Promise<Cart> => {
      if (!cartData.items.length || !checkoutDeliveryMethodId) {
        return cartData;
      }

      if (cartData.appliedDeliveryMethodId === checkoutDeliveryMethodId) {
        return cartData;
      }

      return setCartDeliveryMethod(checkoutDeliveryMethodId, effectiveLangCode);
    },
    [checkoutDeliveryMethodId, effectiveLangCode],
  );

  const refreshCartBeforePayment = useCallback(async (): Promise<Cart | null> => {
    try {
      let latestCart = await queryClient.fetchQuery({
        queryKey: ['cart', effectiveLangCode, cartScope],
        queryFn: () => getCart(effectiveLangCode),
      });
      latestCart = await ensureDeliveryMethodOnCart(latestCart);
      setCartData(latestCart);
      setGlobalCart(latestCart);
      queryClient.setQueryData(['cart', effectiveLangCode, cartScope], latestCart);

      if (!latestCart?.items?.length) {
        redirectToCartBecauseEmpty(true);
        return null;
      }

      return latestCart;
    } catch (err) {
      console.error('Failed to refresh cart before payment:', err);
      showErrorToast(getApiErrorMessage(err, cartRefreshErrorMessage));
      return null;
    }
  }, [
    cartRefreshErrorMessage,
    cartScope,
    effectiveLangCode,
    ensureDeliveryMethodOnCart,
    getApiErrorMessage,
    queryClient,
    redirectToCartBecauseEmpty,
    setGlobalCart,
    showErrorToast,
  ]);

  // Load cart and wallet
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load cart
        let cartData = await queryClient.fetchQuery({
          queryKey: ['cart', effectiveLangCode, cartScope],
          queryFn: () => getCart(effectiveLangCode),
        });
        cartData = await ensureDeliveryMethodOnCart(cartData);
        setCartData(cartData);
        setGlobalCart(cartData);
        queryClient.setQueryData(['cart', effectiveLangCode, cartScope], cartData);

        if (!cartData?.items?.length) {
          redirectToCartBecauseEmpty(true);
          return;
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        const message = getApiErrorMessage(err, loadPaymentErrorMessage);
        setError(message);
        showErrorToast(message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [
    effectiveLangCode,
    isAuthenticated,
    user,
    authLoading,
    queryClient,
    cartScope,
    setGlobalCart,
    getApiErrorMessage,
    ensureDeliveryMethodOnCart,
    redirectToCartBecauseEmpty,
    loadPaymentErrorMessage,
    showErrorToast,
  ]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let isMounted = true;
    const loadGateways = async () => {
      setGatewaysLoading(true);
      try {
        const list = await getActivePaymentGateways();
        if (!isMounted) return;
        setGateways(list);
      } catch (err) {
        console.error('Failed to load gateways:', err);
        if (!isMounted) return;
        setGateways([]);
        showErrorToast(getApiErrorMessage(err, gatewayLoadErrorMessage));
      } finally {
        if (isMounted) {
          setGatewaysLoading(false);
        }
      }
    };
    loadGateways();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, getApiErrorMessage, gatewayLoadErrorMessage, showErrorToast]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let isMounted = true;
    const loadCardToCardSettings = async () => {
      setCardToCardSettingsLoading(true);
      try {
        const settings = await getCardToCardSettings(effectiveLangCode);
        if (!isMounted) return;
        setCardToCardSettings(settings);
      } catch (err) {
        console.error('Failed to load card-to-card settings:', err);
        if (!isMounted) return;
        setCardToCardSettings(null);
        showErrorToast(getApiErrorMessage(err, cardToCardSettingsLoadErrorMessage));
      } finally {
        if (isMounted) {
          setCardToCardSettingsLoading(false);
        }
      }
    };
    loadCardToCardSettings();

    return () => {
      isMounted = false;
    };
  }, [
    authLoading,
    cardToCardSettingsLoadErrorMessage,
    effectiveLangCode,
    getApiErrorMessage,
    isAuthenticated,
    showErrorToast,
  ]);

  useEffect(() => {
    if (loading || gatewaysLoading || cardToCardSettingsLoading) return;

    setPaymentMethod((current) => {
      if (showOnlinePayment) {
        if (current === 'cardToCard' && cardToCardEnabled) return current;
        return 'online';
      }

      if (cardToCardEnabled) return 'cardToCard';
      return 'online';
    });
  }, [loading, gatewaysLoading, cardToCardSettingsLoading, showOnlinePayment, cardToCardEnabled]);

  useEffect(() => {
    if (paymentMethod !== 'online' || !showOnlinePayment) {
      setSelectedGatewayId(null);
      return;
    }

    if (!selectedGatewayId || !gateways.some((g) => g.id === selectedGatewayId)) {
      setSelectedGatewayId(gateways[0].id);
    }
  }, [paymentMethod, showOnlinePayment, gateways, selectedGatewayId]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setPaymentFormError(null);
  };

  const handleCopyDestinationCard = async () => {
    if (!destinationCardNumber) return;

    try {
      await navigator.clipboard.writeText(destinationCardNumber);
      showSuccessToast(t('payment.cardCopied') || 'Card number copied.');
    } catch (err) {
      console.error('Failed to copy card number:', err);
      showWarningToast(t('payment.copyCardError') || 'Could not copy card number.');
    }
  };

  const handleReceiptImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setReceiptUploading(true);
    setPaymentFormError(null);
    try {
      const media = await uploadCardToCardReceiptImage(file, effectiveLangCode);
      setReceiptImage(media);
    } catch (err) {
      setPaymentFormError(getApiErrorMessage(err, receiptUploadErrorMessage));
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleRemoveReceiptImage = () => {
    setReceiptImage(null);
    setPaymentFormError(null);
  };

  const handlePay = async () => {
    if (paying) return;

    if (paymentMethod === 'wallet') {
      // TODO: Wallet payment flow
      return;
    }

    if (paymentMethod === 'cardToCard') {
      setPaymentFormError(null);
      if (!canSubmitCardToCard) {
        setPaymentFormError(cardToCardValidationErrorMessage);
        showWarningToast(cardToCardValidationErrorMessage);
        return;
      }

      const latestCart = await refreshCartBeforePayment();
      if (!latestCart) return;

      setPaying(true);
      try {
        const cardToCardPayload: CardToCardSubmitRequest = {};
        const trimmedTransactionReferenceId = transactionReferenceId.trim();

        if (transactionReferenceField.show && trimmedTransactionReferenceId) {
          cardToCardPayload.transactionReferenceId = trimmedTransactionReferenceId;
        }

        if (sourceCardNumberField.show && sourceCardDigits) {
          cardToCardPayload.paymentCardNumber = sourceCardDigits;
          cardToCardPayload.sourceCardNumber = sourceCardDigits;
        }

        if (sourceCardOwnerNameField.show && sourceCardOwnerNameValue) {
          cardToCardPayload.sourceCardOwnerName = sourceCardOwnerNameValue;
        }

        if (receiptImageField.show && receiptImage?.id) {
          cardToCardPayload.receiptImageMediaId = receiptImage.id;
        }

        const result = await submitCardToCardPayment(cardToCardPayload, effectiveLangCode);

        showSuccessToast(cardToCardSubmittedMessage);
        const params = new URLSearchParams({ method: 'cardToCard' });
        if (result.orderNumber) {
          params.set('orderNumber', result.orderNumber);
        }
        navigate(localizedPath(`/payment/success?${params.toString()}`), { replace: true });
      } catch (err) {
        console.error('Card-to-card payment submit failed:', err);
        const message = getApiErrorMessage(err, cardToCardSubmitErrorMessage);
        setPaymentFormError(message);
        showErrorToast(message);
      } finally {
        setPaying(false);
      }
      return;
    }

    if (paymentMethod === 'online') {
      if (!showOnlinePayment) {
        showWarningToast(
          t('payment.noPaymentMethodsDescription') ||
            'No payment method is available right now. Please try again later.',
        );
        return;
      }

      const latestCart = await refreshCartBeforePayment();
      if (!latestCart) return;

      const gatewayId = selectedGatewayId;
      if (!selectedGatewayId) {
        showWarningToast(selectGatewayValidationMessage);
        return;
      }
      const selectedGateway = gateways.find((g) => g.id === gatewayId);
      const isZarinPal = selectedGateway?.providerName?.toLowerCase() === 'zarinpal';
      setPaying(true);
      try {
        const res = isZarinPal
          ? await requestZarinPalPayment(effectiveLangCode, gatewayId ?? undefined)
          : await requestZibalPayment(effectiveLangCode, gatewayId ?? undefined);
        if (!res?.redirectUrl) {
          showErrorToast(invalidGatewayResponseMessage);
          return;
        }
        window.location.assign(res.redirectUrl);
      } catch (err) {
        console.error('Payment request failed:', err);
        showErrorToast(getApiErrorMessage(err, paymentRequestErrorMessage));
      } finally {
        setPaying(false);
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!discountCode.trim() || !cart) {
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const result = await validateCoupon(
        {
          code: discountCode.trim(),
          orderAmount: cart.subtotal,
          currencyCode: cart.currencyCode,
        },
        effectiveLangCode,
      );

      if (result.isValid && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discountAmount);
        setShowDiscountInput(false);
      } else {
        setCouponError(result.message || t('payment.invalidCoupon') || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError(
        err instanceof Error ? err.message : t('payment.couponError') || 'Failed to apply coupon',
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setDiscountCode('');
    setCouponError(null);
  };

  const calculateTotals = () => {
    if (!cart) return { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 };

    const subtotal = cart.subtotal;
    const shipping = cart.shippingAmount ?? 0;
    const tax = cart.taxAmount ?? 0;
    const discount = cart.totalDiscount + couponDiscount;
    const total = Math.max(0, cart.total - couponDiscount);

    return { subtotal, shipping, tax, discount, total };
  };

  const { subtotal, shipping, tax, discount, total } = calculateTotals();

  const isPayDisabled =
    total <= 0 ||
    paying ||
    noPaymentMethodsAvailable ||
    (paymentMethod === 'online' && (!showOnlinePayment || !selectedGatewayId)) ||
    (paymentMethod === 'cardToCard' && (!cardToCardEnabled || receiptUploading));
  const payButtonLabel = paying
    ? t('common.loading') || 'Loading...'
    : paymentMethod === 'cardToCard'
      ? t('payment.submitReceipt') || 'Submit receipt'
      : t('payment.pay') || 'Pay';
  const showMobilePayBar = !loading && !error && Boolean(cart && cart.items.length > 0);
  const discountPercent =
    cart && cart.subtotal > 0 ? Math.round((cart.totalDiscount / cart.subtotal) * 100) : 0;
  const formattedDiscountPercent = localizeDigits(discountPercent, effectiveLangCode);

  return (
    <main dir={dir} className="page-container page-section pb-32 lg:pb-12">
      <div className="space-y-6">
        <CheckoutStepper currentStep={3} />

        <section className="product-detail-soft-panel flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-color-for-layer-on-body text-first">
              <CreditCard className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="mt-1 flex items-center gap-1 text-sm first-text-color-for-paragraph-low">
                <ShieldCheck className="h-4 w-4 text-first" strokeWidth={1.5} />
                <span>{t('payment.title') || 'Payment'}</span>
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate(localizedPath('/checkout'))}
            className="product-detail-focus gap-2 border border-[color-mix(in_srgb,var(--first-text-color-svg)_14%,transparent)] bg-color-for-layer-on-body first-text-color hover:bg-first hover:text-white"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('common.back') || 'Back'}
          </Button>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start xl:gap-6">
            <div className="product-detail-panel space-y-4 p-4 sm:p-5 lg:col-span-8">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-64 w-full" />
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
                onClick={() => window.location.reload()}
                className="h-11 rounded-lg bg-first px-5 text-white hover:bg-first-600"
              >
                {t('common.retry') || 'Retry'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start xl:gap-6">
            <div className="space-y-5 lg:col-span-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="product-detail-panel relative overflow-hidden p-4 sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
                />

                <div className="mb-8 flex items-center gap-3 pt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-first/10 text-first">
                    <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h1 className="text-xl font-s-bold first-text-color">
                      {t('payment.selectPaymentMethod') || 'Select Payment Method'}
                    </h1>
                  </div>
                </div>

                <div className="space-y-3">
                  {(gatewaysLoading || cardToCardSettingsLoading) && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                      ))}
                    </div>
                  )}

                  {showOnlinePayment && (
                    <article
                      role="button"
                      tabIndex={0}
                      className={cn(' group cursor-pointer', paymentMethod === 'online' && '  ')}
                      onClick={() => handlePaymentMethodChange('online')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePaymentMethodChange('online');
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 ">
                        <span
                          className={cn(
                            ' flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                            paymentMethod === 'online'
                              ? 'border-first bg-first'
                              : 'border-[color-mix(in_srgb,var(--first-text-color-svg)_28%,transparent)]',
                          )}
                        >
                          {paymentMethod === 'online' && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className=" flex items-center gap-3">
                            <span className="flex  shrink-0 items-center justify-center rounded-lg bg-color-for-layer-on-body text-first">
                              <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-s-bold first-text-color">
                                {t('payment.onlinePayment') || 'Online payment'}
                              </h3>
                              <p className="text-sm first-text-color-for-paragraph-low">
                                {t('payment.onlinePaymentDescription') ||
                                  'Pay securely through an active payment gateway.'}
                              </p>
                            </div>
                          </div>

                          {/* {paymentMethod === 'online' && (
                            <div
                              className="mt-4 grid grid-cols-1  gap-2 sm:grid-cols-2 xl:grid-cols-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {gateways.map((g) => (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setSelectedGatewayId(g.id)}
                                  className={cn(
                                    'product-detail-focus flex min-w-0 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--first-text-color-svg)_14%,transparent)] bg-color-for-layer-on-body p-3 text-start transition hover:border-first/30 hover:bg-first/5',
                                    selectedGatewayId === g.id &&
                                      'border-first bg-first/5 shadow-first-sm',
                                  )}
                                >
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-color-for-layer-sec p-1.5">
                                    {g.iconUrl ? (
                                      <img
                                        src={g.iconUrl}
                                        alt=""
                                        width={32}
                                        height={32}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <CreditCard
                                        className="h-5 w-5 first-text-color-svg"
                                        strokeWidth={1.5}
                                      />
                                    )}
                                  </span>
                                  <span className="min-w-0 truncate text-sm font-s-medium first-text-color">
                                    {g.displayName}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )} */}
                        </div>
                      </div>
                    </article>
                  )}

                  {cardToCardEnabled && (
                    <article
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'product-detail-soft-panel product-detail-focus group cursor-pointer p-4 transition-all hover:border-first/25 hover:bg-first/5',
                        paymentMethod === 'cardToCard' && 'border-first bg-first/5 shadow-first-sm',
                      )}
                      onClick={() => handlePaymentMethodChange('cardToCard')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePaymentMethodChange('cardToCard');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 flex-wrap">
                        {/* <div>
                          <span
                            className={cn(
                              'mt-1 flex h-5 w-5  shrink-0 items-center justify-center rounded-full border-2',
                              paymentMethod === 'cardToCard'
                                ? 'border-first bg-first'
                                : 'border-[color-mix(in_srgb,var(--first-text-color-svg)_28%,transparent)]',
                            )}
                          >
                            {paymentMethod === 'cardToCard' && (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </span>
                        </div> */}

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-color-for-layer-on-body text-first">
                              <Landmark className="h-5 w-5" strokeWidth={1.5} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-s-bold first-text-color">
                                {t('payment.cardToCard') || 'Card to card'}
                              </h3>
                              <p className="text-sm first-text-color-for-paragraph-low">
                                {t('payment.cardToCardDescription') ||
                                  'Manual bank transfer with receipt verification.'}
                              </p>
                            </div>
                          </div>

                          {paymentMethod === 'cardToCard' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="mt-4 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,0.95fr)]">
                                <div className="space-y-4 px-2">
                                  <p className="text-xs leading-5 first-text-color-for-paragraph-low">
                                    {t('payment.cardToCardInstructions') ||
                                      'Transfer the exact payable amount, then enter your receipt details below.'}
                                  </p>

                                  {(transactionReferenceField.show ||
                                    sourceCardNumberField.show ||
                                    sourceCardOwnerNameField.show) && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {transactionReferenceField.show && (
                                        <div className="space-y-2">
                                          <PaymentFieldLabel
                                            required={transactionReferenceField.required}
                                          >
                                            {t('payment.transactionReferenceId') ||
                                              'Transaction reference / trace ID'}
                                          </PaymentFieldLabel>
                                          <Input
                                            value={transactionReferenceId}
                                            onChange={(e) => {
                                              setTransactionReferenceId(e.target.value);
                                              setPaymentFormError(null);
                                            }}
                                            placeholder={
                                              t('payment.transactionReferencePlaceholder') ||
                                              'e.g. 123456789'
                                            }
                                            dir="ltr"
                                            required={transactionReferenceField.required}
                                          />
                                        </div>
                                      )}

                                      {sourceCardNumberField.show && (
                                        <div className="space-y-2">
                                          <PaymentFieldLabel
                                            required={sourceCardNumberField.required}
                                          >
                                            {t('payment.sourceCardNumber') || 'Source card number'}
                                          </PaymentFieldLabel>
                                          <Input
                                            value={sourceCardNumber}
                                            onChange={(e) => {
                                              setSourceCardNumber(formatCardNumber(e.target.value));
                                              setPaymentFormError(null);
                                            }}
                                            placeholder={
                                              t('payment.sourceCardPlaceholder') ||
                                              '6037-xxxx-xxxx-xxxx'
                                            }
                                            dir="ltr"
                                            className="font-mono"
                                            inputMode="numeric"
                                            maxLength={19}
                                            required={sourceCardNumberField.required}
                                          />
                                        </div>
                                      )}

                                      {sourceCardOwnerNameField.show && (
                                        <div className="space-y-2">
                                          <PaymentFieldLabel
                                            required={sourceCardOwnerNameField.required}
                                          >
                                            {t('payment.sourceCardOwnerName', {
                                              defaultValue: 'Source card owner name',
                                            }) || 'Source card owner name'}
                                          </PaymentFieldLabel>
                                          <Input
                                            value={sourceCardOwnerName}
                                            onChange={(e) => {
                                              setSourceCardOwnerName(e.target.value);
                                              setPaymentFormError(null);
                                            }}
                                            placeholder={
                                              t('payment.sourceCardOwnerNamePlaceholder', {
                                                defaultValue: 'Enter the owner name on the card',
                                              }) || 'Enter the owner name on the card'
                                            }
                                            required={sourceCardOwnerNameField.required}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {receiptImageField.show && (
                                    <div className="space-y-2">
                                      <PaymentFieldLabel required={receiptImageField.required}>
                                        {t('payment.receiptImage') || 'Receipt image'}
                                      </PaymentFieldLabel>
                                      <p className="text-xs first-text-color-for-paragraph-low">
                                        {t('payment.receiptImageHint') ||
                                          'Upload a photo of your bank transfer receipt to speed up verification.'}
                                      </p>

                                      {receiptImage && receiptImageUrl ? (
                                        <div className="product-detail-soft-panel relative overflow-hidden p-2">
                                          <img
                                            src={receiptImageUrl}
                                            alt={
                                              receiptImage.alt ||
                                              t('payment.receiptImageAlt') ||
                                              'Receipt image'
                                            }
                                            className="max-h-52 w-full rounded-md object-contain"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveReceiptImage}
                                            aria-label={
                                              t('payment.removeReceiptImage') ||
                                              'Remove receipt image'
                                            }
                                            className="absolute end-3 top-3 h-8 w-8 rounded-full bg-black/55 p-0 text-white hover:bg-black/70"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <label className="product-detail-focus flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color-mix(in_srgb,var(--color-first)_36%,transparent)] bg-first/5 px-4 py-6 transition hover:border-first/60 hover:bg-first/10">
                                          <input
                                            type="file"
                                            accept="image/*,.heic,.heif"
                                            className="hidden"
                                            disabled={receiptUploading}
                                            onChange={handleReceiptImageSelect}
                                          />
                                          {receiptUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-first" />
                                          ) : (
                                            <ImagePlus className="h-8 w-8 text-first" />
                                          )}
                                          <span className="text-center text-sm first-text-color-for-paragraph-low">
                                            {receiptUploading
                                              ? t('payment.receiptUploading') || 'Uploading...'
                                              : t('payment.receiptImageSelect') ||
                                                'Choose receipt image'}
                                          </span>
                                        </label>
                                      )}
                                    </div>
                                  )}

                                  {paymentFormError && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                      <p className="text-sm text-red-700 dark:text-red-300">
                                        {paymentFormError}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <div className="relative aspect-[1.586/1] min-h-[190px] overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--color-first)_0%,#14222b_52%,var(--color-secound)_100%)] p-5 text-white shadow-[0_20px_44px_-30px_rgba(20,29,38,0.9)]">
                                    <div
                                      aria-hidden="true"
                                      className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_30%,transparent_31%,transparent_100%)]"
                                    />
                                    <div
                                      aria-hidden="true"
                                      className="absolute bottom-0 end-0 h-24 w-44 translate-x-8 translate-y-6 rotate-[-18deg] rounded-lg bg-white/10"
                                    />

                                    <div className="relative flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-s-bold uppercase text-white/70">
                                          {t('payment.destinationCard') || 'Destination card'}
                                        </p>
                                        <p className="mt-1 text-sm font-s-medium text-white/90">
                                          {t('payment.cardToCard') || 'Card to card'}
                                        </p>
                                      </div>
                                      <Landmark className="h-6 w-6 shrink-0 text-white/80" />
                                    </div>

                                    <div className="relative mt-6 flex items-center justify-between gap-3">
                                      <span className="flex h-9 w-12 items-center justify-center rounded-md border border-white/30 bg-white/20">
                                        <span className="h-5 w-7 rounded-sm border border-white/30" />
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyDestinationCard}
                                        className="h-9 gap-1 border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                                      >
                                        <Copy className="h-4 w-4" />
                                        {t('payment.copyCard') || 'Copy'}
                                      </Button>
                                    </div>

                                    <p
                                      className="relative mt-5 break-words font-mono text-lg font-semibold leading-relaxed text-white sm:text-xl"
                                      dir="ltr"
                                    >
                                      {formatCardNumber(destinationCardNumber, 'en')}
                                    </p>

                                    {accountHolder && (
                                      <div className="relative mt-4 flex items-end justify-between gap-4">
                                        <div className="min-w-0">
                                          <p className="text-[0.68rem] uppercase text-white/60">
                                            {t('payment.accountHolder') || 'Account holder'}
                                          </p>
                                          <p className="mt-1 truncate text-sm font-s-bold text-white">
                                            {accountHolder}
                                          </p>
                                        </div>
                                        <p className="shrink-0 text-xs font-s-bold text-white/70">
                                          FADAEI
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="product-detail-soft-panel p-3">
                                    <SummaryLine
                                      label={t('payment.amountPayable') || 'Amount payable'}
                                      value={
                                        <PriceDisplay
                                          amount={total}
                                          languageCode={effectiveLangCode}
                                        />
                                      }
                                      icon={
                                        <ReceiptText
                                          className="h-4 w-4 text-first"
                                          strokeWidth={1.5}
                                        />
                                      }
                                      highlight
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </article>
                  )}

                  {noPaymentMethodsAvailable && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
                      <div>
                        <p className="font-f-sbold text-amber-800 dark:text-amber-200">
                          {t('payment.noPaymentMethodsTitle') || 'No payment methods available'}
                        </p>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                          {t('payment.noPaymentMethodsDescription') ||
                            'No payment method is available right now. Please try again later.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="product-detail-panel relative overflow-hidden p-4 sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
                />

                <button
                  type="button"
                  onClick={() => setShowDiscountInput(!showDiscountInput)}
                  className="product-detail-focus flex w-full items-center justify-between gap-3 pt-1 text-start"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-first/10 text-first">
                      <Tag className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-s-bold first-text-color">
                        {t('payment.discountCode') || 'Discount Code'}
                      </span>
                      <span className="block text-xs first-text-color-for-paragraph-low">
                        {appliedCoupon
                          ? appliedCoupon.code
                          : t('payment.discountCodeDescription') ||
                            'You can select from saved codes if available, or enter a code yourself.'}
                      </span>
                    </span>
                  </span>
                  {showDiscountInput ? (
                    <ChevronUp className="h-5 w-5 shrink-0 first-text-color-svg" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 first-text-color-svg" />
                  )}
                </button>

                <div className="mt-4">
                  {appliedCoupon ? (
                    <div className="product-detail-soft-panel flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                        <span className="truncate font-s-bold text-green-700 dark:text-green-300">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          <PriceDisplay amount={couponDiscount} languageCode={effectiveLangCode} />
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {t('payment.remove') || 'Remove'}
                      </Button>
                    </div>
                  ) : (
                    showDiscountInput && (
                      <div className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <Input
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder={t('payment.enterDiscountCode') || 'Enter discount code'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !discountCode.trim()}
                            className="h-10 rounded-lg bg-first px-5 font-s-bold text-white hover:bg-first-600"
                          >
                            {applyingCoupon
                              ? t('common.loading') || 'Loading...'
                              : t('payment.apply') || 'Apply'}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-red-600 dark:text-red-400">{couponError}</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </motion.section>
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="lg:sticky lg:top-24">
                <aside className="product-detail-panel relative overflow-hidden p-4 sm:p-5">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-first via-first to-secound"
                  />

                  <div className="space-y-5 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-2">
                          <ReceiptText className="h-5 w-5 text-first" strokeWidth={1.5} />
                          <h2 className="text-lg font-s-bold first-text-color">
                            {t('cart.orderSummary') || 'Order Summary'}
                          </h2>
                        </span>
                        {cart && cart.items.length > 0 && (
                          <p className="mt-1 text-xs first-text-color-for-paragraph-low">
                            {cart.itemCount} {t('cart.shipment') || 'items'}
                          </p>
                        )}
                      </div>
                    </div>

                    {cart && cart.items.length > 0 && (
                      <div>
                        <SummaryLine
                          icon={<ShoppingCart className="h-4 w-4 text-first" strokeWidth={1.5} />}
                          label={`${t('cart.priceOfItems') || 'Price of items'} (${cart.itemCount})`}
                          value={
                            <PriceDisplay amount={subtotal} languageCode={effectiveLangCode} />
                          }
                        />

                        {(cart.appliedDeliveryMethodId != null || shipping > 0) && (
                          <SummaryLine
                            icon={<Truck className="h-4 w-4 text-first" strokeWidth={1.5} />}
                            label={t('payment.shippingCost') || 'Shipping cost'}
                            value={
                              <PriceDisplay amount={shipping} languageCode={effectiveLangCode} />
                            }
                          />
                        )}

                        {tax > 0 && (
                          <SummaryLine
                            icon={<ReceiptText className="h-4 w-4 text-first" strokeWidth={1.5} />}
                            label={t('payment.tax') || 'Tax'}
                            value={<PriceDisplay amount={tax} languageCode={effectiveLangCode} />}
                          />
                        )}

                        {discount > 0 && (
                          <SummaryLine
                            icon={
                              <Tag
                                className="h-4 w-4 text-green-600 dark:text-green-400"
                                strokeWidth={1.5}
                              />
                            }
                            label={`${t('cart.yourProfit') || 'Your profit from purchase'} (${formattedDiscountPercent}%)`}
                            value={
                              <span className="text-green-600 dark:text-green-400">
                                <PriceDisplay amount={discount} languageCode={effectiveLangCode} />
                              </span>
                            }
                          />
                        )}
                      </div>
                    )}

                    <div className="product-detail-soft-panel p-4">
                      <SummaryLine
                        icon={<CheckCircle className="h-5 w-5 text-first" strokeWidth={1.5} />}
                        label={t('cart.cartTotal') || 'Cart Total'}
                        value={<PriceDisplay amount={total} languageCode={effectiveLangCode} />}
                        highlight
                      />
                    </div>

                    <Button
                      disabled={isPayDisabled}
                      onClick={handlePay}
                      className="h-12 w-full gap-2 rounded-lg bg-first text-base font-s-bold text-white hover:bg-first-600"
                      size="lg"
                    >
                      {payButtonLabel}
                      <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>

                    {cart && cart.items.length > 0 && (
                      <p className="text-xs first-text-color-for-paragraph-low">
                        {t('cart.paymentNote')}
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMobilePayBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--first-text-color-svg)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg-color-for-layer-on-body)_94%,transparent)] px-3 pt-3 shadow-[0_-18px_34px_-28px_rgba(20,29,38,0.85)] backdrop-blur lg:hidden">
          <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}>
            <div
              className={`mb-3 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-xs first-text-color-for-paragraph-low">
                {t('payment.amountPayable') || 'Amount payable'}
              </span>
              <span className="text-lg font-s-bold first-text-color">
                <PriceDisplay amount={total} languageCode={effectiveLangCode} />
              </span>
            </div>
            <Button
              onClick={handlePay}
              disabled={isPayDisabled}
              className="h-12 w-full gap-2 rounded-lg bg-first font-s-bold text-white hover:bg-first-600"
              size="lg"
            >
              {payButtonLabel}
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
