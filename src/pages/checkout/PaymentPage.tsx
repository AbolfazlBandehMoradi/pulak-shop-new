import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  Tag,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getCart, type Cart } from '@/utils/cartApi';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { validateCoupon, type Coupon } from '@/utils/couponApi';
import { getWalletByUserId, type Wallet as WalletType } from '@/utils/walletApi';
import { getActivePaymentGateways, type ActivePaymentGateway } from '@/utils/paymentGatewayApi';
import { requestZibalPayment } from '@/utils/zibalApi';
import { requestZarinPalPayment } from '@/utils/zarinpalApi';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import useCartStore from '@/stores/cartStore';
import { useToast } from '@/context/ToastContext';
import CheckoutStepper from '@/components/reusable-components/CheckoutStepper/CheckoutStepper';

type PaymentMethod = 'online' | 'wallet';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const setGlobalCart = useCartStore((state) => state.setCart);
  const { error: showErrorToast, warning: showWarningToast } = useToast();

  // Determine language code from global language store
  const effectiveLangCode = currentLanguage || 'fa';
  const isRTL = dir === 'rtl';
  const isPersian = effectiveLangCode === 'fa';
  const cartScope = isAuthenticated ? `user:${user?.id ?? 'authenticated'}` : 'guest';

  // Keep redirect behavior aligned with protected route pattern
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(localizedPath('/auth'), {
        replace: true,
        state: { redirectUrl: location.pathname + location.search },
      });
    }
  }, [authLoading, isAuthenticated, location.pathname, location.search, localizedPath, navigate]);

  const [cart, setCartData] = useState<Cart | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
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
  const [paying, setPaying] = useState(false);

  // Load cart and wallet
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load cart
        const cartData = await queryClient.fetchQuery({
          queryKey: ['cart', effectiveLangCode, cartScope],
          queryFn: () => getCart(effectiveLangCode),
        });
        setCartData(cartData);
        setGlobalCart(cartData);

        // Load wallet if user is authenticated
        if (isAuthenticated && user?.id) {
          try {
            const walletData = await getWalletByUserId(user.id);
            setWallet(walletData);
          } catch (err) {
            console.error('Failed to load wallet:', err);
            // Wallet might not exist, which is okay
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [effectiveLangCode, isAuthenticated, user, authLoading, queryClient, cartScope, setGlobalCart]);

  useEffect(() => {
    if (paymentMethod !== 'online') return;
    const loadGateways = async () => {
      setGatewaysLoading(true);
      try {
        const list = await getActivePaymentGateways();
        setGateways(list);
      } catch (err) {
        console.error('Failed to load gateways:', err);
      } finally {
        setGatewaysLoading(false);
      }
    };
    loadGateways();
  }, [paymentMethod]);

  useEffect(() => {
    if (paymentMethod !== 'online' || gateways.length === 0) {
      setSelectedGatewayId(null);
    } else if (!selectedGatewayId && gateways.length > 0) {
      setSelectedGatewayId(gateways[0].id);
    }
  }, [paymentMethod, gateways, selectedGatewayId]);

  const handlePay = async () => {
    if (paymentMethod === 'wallet') {
      // TODO: Wallet payment flow
      return;
    }
    if (paymentMethod === 'online') {
      let latestCart: Cart;
      try {
        latestCart = await queryClient.fetchQuery({
          queryKey: ['cart', effectiveLangCode, cartScope],
          queryFn: () => getCart(effectiveLangCode),
        });
        setCartData(latestCart);
        setGlobalCart(latestCart);
      } catch (err) {
        console.error('Failed to refresh cart before payment:', err);
        showErrorToast(t('common.retry') || 'Failed to refresh cart. Please try again.');
        return;
      }

      if (!latestCart.items.length) {
        showWarningToast(t('cart.emptyCart') || 'Your cart is empty');
        navigate(localizedPath('/cart'));
        return;
      }

      const gatewayId = gateways.length > 0 ? selectedGatewayId : undefined;
      if (gateways.length > 0 && !selectedGatewayId) return;
      const selectedGateway = gateways.find((g) => g.id === (selectedGatewayId ?? gatewayId));
      const isZarinPal = selectedGateway?.providerName?.toLowerCase() === 'zarinpal';
      setPaying(true);
      try {
        const res = isZarinPal
          ? await requestZarinPalPayment(effectiveLangCode, gatewayId ?? undefined)
          : await requestZibalPayment(effectiveLangCode, gatewayId ?? undefined);
        if (res?.redirectUrl) {
          window.location.href = res.redirectUrl;
        }
      } catch (err) {
        console.error('Payment request failed:', err);
        setError(err instanceof Error ? err.message : 'Payment request failed');
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
    if (!cart) return { subtotal: 0, shipping: 0, discount: 0, total: 0 };

    const subtotal = cart.subtotal;
    const shipping = 0; // TODO: Calculate shipping cost based on address
    const discount = cart.totalDiscount + couponDiscount;
    const total = Math.max(0, subtotal + shipping - discount);

    return { subtotal, shipping, discount, total };
  };

  const { subtotal, shipping, discount, total } = calculateTotals();

  const walletBalance = wallet?.balance || 0;
  const canUseWallet = walletBalance > 0 && walletBalance >= total;
  const isPayDisabled =
    total <= 0 || (paymentMethod === 'online' && gateways.length > 0 && !selectedGatewayId) || paying;
  const showMobilePayBar = !loading && !error && Boolean(cart && cart.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main dir={dir} className="flex-1 container mx-auto px-4 pt-6 pb-28 lg:pb-6">
        <CheckoutStepper currentStep={3} />
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('payment.title') || 'Payment'}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4" />
                  {t('payment.selectPaymentMethod') || 'Select Payment Method'}
                </p>
              </div>
            </div>
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
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('common.retry') || 'Retry'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg"
              >
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  {t('payment.selectPaymentMethod') || 'Select Payment Method'}
                </h2>

                <div className="space-y-3">
                  {/* Online Payment */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'online'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 ${paymentMethod === 'online' ? 'text-blue-500' : 'text-gray-400'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'online'
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {paymentMethod === 'online' && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard
                            className={`h-5 w-5 ${paymentMethod === 'online' ? 'text-blue-500' : 'text-gray-400'}`}
                          />
                          <h3 className="font-semibold">
                            {t('payment.onlinePayment') || 'Online Payment'}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('payment.onlinePaymentDescription') ||
                            'Online payment with all bank cards'}
                        </p>
                        {paymentMethod === 'online' && (
                          <>
                            <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-800 dark:text-blue-200">
                                {t('payment.onlinePaymentInfo') ||
                                  'According to Central Bank regulations, the payment gateway limit is 195 million Tomans. Therefore, by paying this amount first, your order will be finalized and reserved, and the remainder can be paid in a separate transaction.'}
                              </p>
                            </div>
                            {gatewaysLoading ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {[1, 2, 3].map((i) => (
                                  <Skeleton key={i} className="h-14 rounded-lg" />
                                ))}
                              </div>
                            ) : gateways.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {gateways.map((g) => (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGatewayId(g.id);
                                    }}
                                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors text-left ${
                                      selectedGatewayId === g.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500 ring-2 ring-blue-500/50'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                    }`}
                                  >
                                    {g.iconUrl ? (
                                      <img
                                        src={g.iconUrl}
                                        alt=""
                                        className="h-8 w-8 object-contain flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                        <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium truncate">
                                      {g.displayName}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wallet Payment */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    } ${!canUseWallet ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => canUseWallet && setPaymentMethod('wallet')}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 ${paymentMethod === 'wallet' ? 'text-blue-500' : 'text-gray-400'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'wallet'
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {paymentMethod === 'wallet' && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet
                            className={`h-5 w-5 ${paymentMethod === 'wallet' ? 'text-blue-500' : 'text-gray-400'}`}
                          />
                          <h3 className="font-semibold">{t('payment.wallet') || 'Wallet'}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('payment.walletBalance') || 'Balance'}{' '}
                          <PriceDisplay amount={walletBalance} languageCode={effectiveLangCode} />
                        </p>
                        {!canUseWallet && walletBalance < total && (
                          <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-800 dark:text-red-200">
                              {t('payment.insufficientWalletBalance') ||
                                'Your wallet balance is not sufficient for this order. You can increase your wallet balance up to 200 million Tomans daily, but your order amount is more than this.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Discount Code Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-green-500" />
                    {t('payment.discountCode') || 'Discount Code'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    {showDiscountInput ? (
                      <>
                        {t('payment.hide') || 'Hide'}
                        <ChevronUp className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      </>
                    ) : (
                      <>
                        {t('payment.selectOrEnterCode') || 'Select or enter discount code'}
                        <ChevronDown className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      </>
                    )}
                  </Button>
                </div>

                {appliedCoupon ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          -
                          <PriceDisplay amount={couponDiscount} languageCode={effectiveLangCode} />
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        {t('payment.remove') || 'Remove'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('payment.discountCodeDescription') ||
                        'You can select from saved codes if available, or enter a code yourself.'}
                    </p>
                    {showDiscountInput && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder={t('payment.enterDiscountCode') || 'Enter discount code'}
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <Button
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !discountCode.trim()}
                            className="bg-green-600 hover:bg-green-700"
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
                    )}
                  </>
                )}
              </motion.div>

              {/* Gift Card Section - Hidden for now */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-500" />
                    {t('payment.giftCard') || 'Gift Card'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGiftCardInput(!showGiftCardInput)}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    {showGiftCardInput ? (
                      <>
                        {t('payment.hide') || 'Hide'}
                        <ChevronUp className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      </>
                    ) : (
                      <>
                        {t('payment.selectOrEnterGiftCard') || 'Select or enter gift card'}
                        <ChevronDown className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                      </>
                    )}
                  </Button>
                </div>

                {showGiftCardInput && (
                  <div className="space-y-3">
                    <Input
                      placeholder={t('payment.enterGiftCardCode') || 'Enter gift card code'}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      {t('payment.applyGiftCard') || 'Apply Gift Card'}
                    </Button>
                  </div>
                )}
              </motion.div> */}
            </div>

            {/* Right Column - Order Summary */}
            <div className="hidden lg:col-span-1 lg:block">
              <div className="lg:sticky lg:top-4">
                <div className="border rounded-lg shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 space-y-4">
                  {cart && cart.items.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">
                          {t('cart.orderSummary') || 'Order Summary'}
                        </h2>
                      </div>

                      {/* Price of Items */}
                      <div
                        className={`flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        {isPersian ? (
                          <>
                            <span className="font-semibold">
                              <PriceDisplay amount={subtotal} languageCode={effectiveLangCode} />
                            </span>
                            <span className="text-muted-foreground flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              {t('payment.priceOfItems') || 'Price of items'} ({cart.itemCount})
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              {t('payment.priceOfItems') || 'Price of items'} ({cart.itemCount})
                            </span>
                            <span className="font-semibold">
                              <PriceDisplay amount={subtotal} languageCode={effectiveLangCode} />
                            </span>
                          </>
                        )}
                      </div>

                      {/* Shipping Cost */}
                      {shipping > 0 && (
                        <div
                          className={`flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          {isPersian ? (
                            <>
                              <span className="font-semibold">
                                <PriceDisplay amount={shipping} languageCode={effectiveLangCode} />
                              </span>
                              <span className="text-muted-foreground">
                                {t('payment.shippingCost') || 'Shipping cost'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                {t('payment.shippingCost') || 'Shipping cost'}
                              </span>
                              <span className="font-semibold">
                                <PriceDisplay amount={shipping} languageCode={effectiveLangCode} />
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Discount */}
                      {discount > 0 && (
                        <div
                          className={`flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          {isPersian ? (
                            <>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                -
                                <PriceDisplay amount={discount} languageCode={effectiveLangCode} />
                              </span>
                              <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                {t('payment.discount') || 'Discount'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-700 dark:text-green-300 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                {t('payment.discount') || 'Discount'}
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                -
                                <PriceDisplay amount={discount} languageCode={effectiveLangCode} />
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Total Payable */}
                      <div
                        className={`flex justify-between items-center pt-4 border-t-2 border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        {isPersian ? (
                          <>
                            <span className="font-bold text-lg text-red-600 dark:text-red-400">
                              <PriceDisplay amount={total} languageCode={effectiveLangCode} />
                            </span>
                            <span className="text-foreground font-bold flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-red-500" />
                              {t('payment.amountPayable') || 'Amount payable'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-foreground font-bold flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-red-500" />
                              {t('payment.amountPayable') || 'Amount payable'}
                            </span>
                            <span className="font-bold text-lg text-red-600 dark:text-red-400">
                              <PriceDisplay amount={total} languageCode={effectiveLangCode} />
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t dark:border-gray-700">
                    <Button
                      onClick={handlePay}
                      disabled={isPayDisabled}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200"
                      size="lg"
                    >
                      {paying ? t('common.loading') || 'Loading...' : t('payment.pay') || 'Pay'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMobilePayBar && (
          <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-gray-300/50 bg-color-for-layer-on-body shadow-dark-sm lg:hidden">
            <div
              className="mx-auto w-full max-w-3xl px-4 pt-3"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm first-text-color-for-paragraph">
                  {t('payment.amountPayable') || 'Amount payable'}
                </span>
                <span className="text-base font-s-sbold text-red-600 dark:text-red-400">
                  <PriceDisplay amount={total} languageCode={effectiveLangCode} />
                </span>
              </div>
              <Button
                onClick={handlePay}
                disabled={isPayDisabled}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {paying ? t('common.loading') || 'Loading...' : t('payment.pay') || 'Pay'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
