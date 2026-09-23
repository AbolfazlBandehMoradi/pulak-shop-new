import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Truck,
  User,
  X,
} from 'lucide-react';
import type { OrderDetail, OrderShippingAddress } from '@/types/order.types';
import { fetchProfileOrder } from '@/utils/profileOrderApi';
import {
  formatOrderDateTime,
  orderStatusTone,
  paymentStatusTone,
  resolveAddressFromJson,
  resolveShippingAddress,
  translateOrderStatus,
  translatePaymentStatus,
} from '@/utils/orderDetailHelpers';
import getImageUrl from '@/utils/getImageUrl';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { getLocaleForLanguageCode } from '@/utils/langRouting';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderInvoicePrintButton } from '@/components/prints';
import { usePageScrollLock } from '@/hooks/usePageScrollLock';

interface OrderDetailModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  authToken: string | null;
  cachedOrder?: OrderDetail | null;
  onOrderLoaded?: (order: OrderDetail) => void;
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">
      <div className="text-xs font-f-sbold uppercase tracking-wide first-text-color-for-paragraph-low">
        {label}
      </div>
      <div
        className={`mt-1 text-sm first-text-color ${
          mono ? 'break-all font-mono text-xs sm:text-sm' : ''
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ModalSection({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: typeof Package;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-first-100/80 bg-color-for-layer-on-body p-4 shadow-dark-sm ${className}`}
    >
      <h3 className="mb-4 flex items-center gap-2 border-b border-gray-300/40 pb-3 font-s-sbold first-text-color">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-first/10 text-first">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ShippingAddressCard({
  address,
  t,
}: {
  address: OrderShippingAddress;
  t: (key: string) => string;
}) {
  const displayName =
    address.fullName || [address.firstName, address.lastName].filter(Boolean).join(' ') || null;

  return (
    <div className="space-y-3 text-sm first-text-color">
      {address.title && (
        <DetailField label={t('profile.orders.addressTitle')} value={address.title} />
      )}
      {displayName && <DetailField label={t('profile.orders.name')} value={displayName} />}
      {address.phone && (
        <div className="flex items-center gap-2 rounded-2xl bg-color-for-layer-sec px-3 py-3">
          <Phone className="h-4 w-4 shrink-0 text-first" />
          <span className="tabular-nums">{address.phone}</span>
        </div>
      )}
      {address.alternativePhone && (
        <div className="flex items-center gap-2 rounded-2xl bg-color-for-layer-sec px-3 py-3">
          <Phone className="h-4 w-4 shrink-0 text-first" />
          <span className="tabular-nums">{address.alternativePhone}</span>
        </div>
      )}
      {address.addressLine1 && (
        <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">{address.addressLine1}</div>
      )}
      {address.addressLine2 && (
        <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">{address.addressLine2}</div>
      )}
      {(address.city || address.province || address.postalCode) && (
        <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">
          {[address.city, address.province].filter(Boolean).join(', ')}
          {address.postalCode ? ` - ${address.postalCode}` : ''}
        </div>
      )}
      {address.country && (
        <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">{address.country}</div>
      )}
      {address.additionalDetails && (
        <div className="rounded-2xl border border-first-100/80 bg-first/5 px-3 py-3 first-text-color-for-paragraph">
          {address.additionalDetails}
        </div>
      )}
    </div>
  );
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  authToken,
  cachedOrder,
  onOrderLoaded,
}: OrderDetailModalProps) {
  const { t } = useTranslation();
  const currentLanguage = useLangStore((s) => s.lang);
  const dir = useLangStore((s) => s.dir);

  const [order, setOrder] = useState<OrderDetail | null>(cachedOrder ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  usePageScrollLock(isOpen);

  const locale = getLocaleForLanguageCode(currentLanguage);
  const notAvailable = '-';

  const translateOr = useCallback(
    (key: string, fallback: string) => {
      const translated = t(key);
      return translated && translated !== key ? translated : fallback;
    },
    [t],
  );

  const loadOrder = useCallback(async () => {
    if (!orderId || !authToken) return;
    if (cachedOrder?.id === orderId) {
      setOrder(cachedOrder);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfileOrder(orderId, authToken);
      setOrder(data);
      onOrderLoaded?.(data);
    } catch (err: unknown) {
      console.error('Failed to load order:', err);
      const message =
        axios.isAxiosError(err) && err.response?.status === 404
          ? translateOr('profile.orders.notFound', 'Order not found')
          : translateOr('profile.orderLoadError', 'Failed to load order details');
      setError(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [authToken, cachedOrder, onOrderLoaded, orderId, translateOr]);

  useEffect(() => {
    if (isOpen && orderId) {
      void loadOrder();
    }
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen, loadOrder, orderId]);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocusedElement = document.activeElement as HTMLElement | null;

    const focusFrame = window.requestAnimationFrame(() => {
      const closeButton = dialogRef.current?.querySelector<HTMLElement>('[data-dialog-close]');
      (closeButton ?? dialogRef.current)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('aria-hidden'));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements?.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  const shippingAddress = useMemo(() => (order ? resolveShippingAddress(order) : null), [order]);
  const billingAddress = useMemo(
    () => (order ? resolveAddressFromJson(order.billingAddressJson) : null),
    [order],
  );

  const savedDeliveryFee = order?.delivery?.baseCost ?? 0;
  const merchandiseSubtotalExShipping = order
    ? order.totalAmount - order.taxAmount + order.discountAmount - savedDeliveryFee
    : 0;

  const resolveImageUrl = (path: string) => getImageUrl(path) ?? path;
  const orderHeading = order?.orderNumber
    ? `#${order.orderNumber}`
    : orderId
      ? `#${orderId}`
      : notAvailable;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-contain bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-dialog-title"
            tabIndex={-1}
            className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden overscroll-contain bg-color-for-layer-sec shadow-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border sm:border-first-100/80"
            initial={{ opacity: 0, y: 44, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 44, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            <header className="shrink-0 border-b border-gray-300/40 bg-color-for-layer-on-body p-3 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-first to-first-700 text-white shadow-first-sm sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="hidden text-sm first-text-color-for-paragraph-low sm:block">
                      {translateOr('profile.orderDetails', 'Order details')}
                    </p>
                    <h2
                      id="order-detail-dialog-title"
                      className="truncate text-xl font-s-sbold first-text-color sm:text-2xl"
                    >
                      {orderHeading}
                    </h2>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {order && (
                    <OrderInvoicePrintButton
                      order={order}
                      dir={dir}
                      locale={locale}
                      languageCode={currentLanguage}
                      t={t}
                      label={translateOr('profile.printInvoice', 'Print invoice')}
                      resolveImageUrl={resolveImageUrl}
                      className="rounded-xl border-first/30 px-2 text-first hover:bg-first hover:text-white sm:px-3 [&>span]:sr-only sm:[&>span]:not-sr-only"
                      size="sm"
                      variant="outline"
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-dialog-close=""
                    onClick={onClose}
                    aria-label={translateOr('profile.closeOrderDetails', 'Close order details')}
                    className="h-10 w-10 rounded-xl border border-gray-300/50 bg-color-for-layer-sec p-0 first-text-color-for-paragraph hover:bg-first hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain p-3 sm:p-5">
              {loading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Skeleton className="h-32 rounded-3xl lg:col-span-2" />
                  <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
                  <Skeleton className="h-52 rounded-3xl" />
                  <Skeleton className="h-52 rounded-3xl" />
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-red-200/70 bg-color-for-layer-on-body px-5 py-12 text-center shadow-dark-sm dark:border-red-900/50">
                  <p className="text-base font-f-sbold text-red-600 dark:text-red-300">{error}</p>
                  <Button
                    className="mt-4 gap-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                    size="sm"
                    onClick={() => void loadOrder()}
                  >
                    <Loader2 className="h-4 w-4" />
                    {translateOr('common.retry', 'Retry')}
                  </Button>
                </div>
              ) : order ? (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                    {[
                      {
                        icon: Package,
                        label: translateOr('profile.orders.orderStatus', 'Order status'),
                        value: (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-f-sbold ${orderStatusTone(order.orderStatus)}`}
                          >
                            {translateOrderStatus(order.orderStatus, t)}
                          </span>
                        ),
                      },
                      {
                        icon: CreditCard,
                        label: translateOr('profile.orders.paymentStatus', 'Payment status'),
                        value: (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-f-sbold ${paymentStatusTone(order.paymentStatus)}`}
                          >
                            {translatePaymentStatus(order.paymentStatus, t)}
                          </span>
                        ),
                      },
                      {
                        icon: Receipt,
                        label: translateOr('profile.total', 'Total'),
                        value: (
                          <PriceDisplay
                            amount={order.totalAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                            valueClassName="text-lg font-s-sbold"
                          />
                        ),
                      },
                      {
                        icon: Calendar,
                        label: translateOr('profile.date', 'Date'),
                        value: formatOrderDateTime(order.createdAt, locale) ?? notAvailable,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-first-100/70 bg-color-for-layer-on-body p-3 shadow-dark-sm"
                      >
                        <div className="mb-2 flex items-center gap-2 first-text-color-for-paragraph-low">
                          <Icon className="h-4 w-4 text-first" />
                          <span className="text-xs font-f-sbold uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                        <div className="text-sm first-text-color">{value}</div>
                      </div>
                    ))}
                  </div>

                  <ModalSection
                    title={translateOr('profile.orders.orderItems', 'Order items')}
                    icon={Package}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm first-text-color-for-paragraph-low">
                        {translateOr('profile.orders.quantity', 'Qty')}: {order?.items?.length}
                      </p>
                      <span className="rounded-full bg-first/10 px-3 py-1 text-xs font-f-sbold text-first">
                        {order.currencyCode || order.currencySymbol || 'IRT'}
                      </span>
                    </div>

                    {order?.items?.length === 0 ? (
                      <p className="rounded-2xl bg-color-for-layer-sec px-4 py-10 text-center text-sm first-text-color-for-paragraph-low">
                        {translateOr('profile.orders.noItems', 'No items in this order.')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {order.items.map((item) => {
                          const imgPath =
                            item.productImage?.thumbnailPath || item.productImage?.filePath;
                          return (
                            <div
                              key={item.id}
                              className="grid gap-3 rounded-2xl bg-color-for-layer-sec p-3 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center"
                            >
                              <div className="h-18 w-18 overflow-hidden rounded-2xl border border-first-100/80 bg-color-for-layer-on-body">
                                {imgPath ? (
                                  <img
                                    src={resolveImageUrl(imgPath)}
                                    alt={item.productImage?.alt || item.itemName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-first">
                                    <Package className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="line-clamp-2 font-f-sbold first-text-color">
                                  {item.itemName}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs first-text-color-for-paragraph-low">
                                  <span>
                                    {translateOr('profile.orders.sku', 'SKU')}: {item.sku}
                                  </span>
                                  <span className="rounded-full bg-color-for-layer-on-body px-2 py-0.5">
                                    {translateOr('profile.orders.quantity', 'Qty')}: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div className="text-start sm:text-end">
                                <div className="font-s-sbold text-first">
                                  <PriceDisplay
                                    amount={item.total}
                                    currency={order.currencyCode || order.currencySymbol}
                                    currencyMode="symbol"
                                    languageCode={currentLanguage}
                                    valueClassName="font-s-sbold"
                                  />
                                </div>
                                <div className="mt-1 text-xs first-text-color-for-paragraph-low">
                                  <PriceDisplay
                                    amount={item.unitPrice}
                                    currency={order.currencyCode || order.currencySymbol}
                                    currencyMode="symbol"
                                    languageCode={currentLanguage}
                                  />{' '}
                                  {translateOr('profile.orders.each', 'each')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl border border-first-100/80 bg-color-for-layer-sec p-4">
                      <div className="ms-auto max-w-md space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="first-text-color-for-paragraph-low">
                            {translateOr('profile.orders.subtotal', 'Subtotal')}
                          </span>
                          <PriceDisplay
                            amount={merchandiseSubtotalExShipping}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                          />
                        </div>
                        {savedDeliveryFee > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="first-text-color-for-paragraph-low">
                              {translateOr('profile.orders.deliveryFee', 'Delivery')}
                            </span>
                            <PriceDisplay
                              amount={savedDeliveryFee}
                              currency={order.currencyCode || order.currencySymbol}
                              currencyMode="symbol"
                              languageCode={currentLanguage}
                            />
                          </div>
                        )}
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between gap-4">
                            <span className="first-text-color-for-paragraph-low">
                              {translateOr('profile.orders.discount', 'Discount')}
                            </span>
                            <PriceDisplay
                              amount={-order.discountAmount}
                              currency={order.currencyCode || order.currencySymbol}
                              currencyMode="symbol"
                              languageCode={currentLanguage}
                            />
                          </div>
                        )}
                        <div className="flex justify-between gap-4">
                          <span className="first-text-color-for-paragraph-low">
                            {translateOr('profile.orders.tax', 'Tax')}
                          </span>
                          <PriceDisplay
                            amount={order.taxAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                          />
                        </div>
                        <div className="flex justify-between gap-4 border-t border-gray-300/40 pt-3 text-base font-s-sbold first-text-color">
                          <span>{translateOr('profile.total', 'Total')}</span>
                          <PriceDisplay
                            amount={order.totalAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                            valueClassName="font-s-sbold"
                          />
                        </div>
                      </div>
                    </div>
                  </ModalSection>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ModalSection
                      title={translateOr('profile.orders.customer', 'Customer')}
                      icon={User}
                    >
                      {order.userName ? (
                        <div className="space-y-3 text-sm">
                          <DetailField
                            label={translateOr('profile.orders.name', 'Name')}
                            value={order.userName}
                          />
                          {order.userEmail && (
                            <div className="flex items-center gap-2 rounded-2xl bg-color-for-layer-sec px-3 py-3">
                              <Mail className="h-4 w-4 shrink-0 text-first" />
                              <span className="min-w-0 break-words first-text-color">
                                {order.userEmail}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="rounded-2xl bg-color-for-layer-sec px-3 py-3 text-sm first-text-color-for-paragraph-low">
                          {translateOr('profile.orders.guest', 'Guest customer')}
                        </p>
                      )}
                    </ModalSection>

                    <ModalSection
                      title={translateOr('profile.orders.orderInfo', 'Order information')}
                      icon={Hash}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailField
                          label={translateOr('profile.orders.orderNumber', 'Order number')}
                          value={order.orderNumber}
                          mono
                        />
                        <DetailField
                          label={translateOr('profile.orders.currencyCode', 'Currency')}
                          value={`${order.currencyCode}${
                            order.currencySymbol && order.currencySymbol !== order.currencyCode
                              ? ` (${order.currencySymbol})`
                              : ''
                          }`}
                        />
                        <DetailField
                          label={translateOr('profile.orders.createdAt', 'Created at')}
                          value={formatOrderDateTime(order.createdAt, locale) ?? notAvailable}
                        />
                        <DetailField
                          label={translateOr('profile.orders.completedAt', 'Completed at')}
                          value={formatOrderDateTime(order.completedAt, locale) ?? notAvailable}
                        />
                      </div>
                    </ModalSection>

                    <ModalSection
                      title={translateOr('profile.orders.shippingAddress', 'Shipping address')}
                      icon={MapPin}
                    >
                      {shippingAddress ? (
                        <ShippingAddressCard address={shippingAddress} t={t} />
                      ) : (
                        <p className="rounded-2xl bg-color-for-layer-sec px-3 py-3 text-sm first-text-color-for-paragraph-low">
                          {translateOr(
                            'profile.orders.noShippingAddress',
                            'No shipping address on file.',
                          )}
                        </p>
                      )}
                    </ModalSection>

                    <ModalSection
                      title={translateOr('profile.orders.paymentInfo', 'Payment information')}
                      icon={Receipt}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailField
                          label={translateOr('profile.orders.paymentStatus', 'Payment status')}
                          value={
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-f-sbold ${paymentStatusTone(order.paymentStatus)}`}
                            >
                              {translatePaymentStatus(order.paymentStatus, t)}
                            </span>
                          }
                        />
                        <DetailField
                          label={translateOr('profile.orders.paidAt', 'Paid at')}
                          value={formatOrderDateTime(order.paidAt, locale) ?? notAvailable}
                        />
                        {order.transactionReferenceId && (
                          <DetailField
                            label={translateOr(
                              'profile.orders.transactionReferenceId',
                              'Transaction reference',
                            )}
                            value={order.transactionReferenceId}
                            mono
                          />
                        )}
                      </div>
                    </ModalSection>

                    {order.delivery && (
                      <ModalSection
                        title={translateOr('profile.orders.deliveryInfo', 'Delivery')}
                        icon={Truck}
                        className="lg:col-span-2"
                      >
                        <div className="space-y-3 text-sm">
                          <div className="rounded-2xl bg-color-for-layer-sec px-3 py-3">
                            <div className="font-f-sbold first-text-color">
                              {order.delivery.localizedMethodName?.[currentLanguage] ||
                                order.delivery.localizedMethodName?.en ||
                                order.delivery.methodName}
                            </div>
                            {(order.delivery.baseCost ?? 0) > 0 && (
                              <div className="mt-2 text-first">
                                <PriceDisplay
                                  amount={order.delivery.baseCost ?? 0}
                                  currency={order.currencyCode || order.currencySymbol}
                                  currencyMode="symbol"
                                  languageCode={currentLanguage}
                                />
                              </div>
                            )}
                          </div>

                          {order?.delivery?.fieldDefinitions?.length > 0 && (
                            <dl className="grid gap-3 sm:grid-cols-2">
                              {order.delivery.fieldDefinitions.map((def) => (
                                <div
                                  key={def.key}
                                  className="rounded-2xl bg-color-for-layer-sec px-3 py-3"
                                >
                                  <dt className="text-xs first-text-color-for-paragraph-low">
                                    {def.label?.[currentLanguage] ||
                                      def.label?.en ||
                                      def.label?.fa ||
                                      def.key}
                                  </dt>
                                  <dd className="mt-1 font-f-sbold first-text-color">
                                    {order.delivery?.fieldValues[def.key] ?? notAvailable}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>
                      </ModalSection>
                    )}

                    {billingAddress && (
                      <ModalSection
                        title={translateOr('profile.orders.billingAddress', 'Billing address')}
                        icon={CreditCard}
                        className="lg:col-span-2"
                      >
                        <ShippingAddressCard address={billingAddress} t={t} />
                      </ModalSection>
                    )}

                    {order.notes && (
                      <ModalSection
                        title={translateOr('profile.orders.notes', 'Notes')}
                        icon={FileText}
                        className="lg:col-span-2"
                      >
                        <p className="whitespace-pre-wrap rounded-2xl bg-color-for-layer-sec px-3 py-3 text-sm first-text-color">
                          {order.notes}
                        </p>
                      </ModalSection>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {loading && order && (
              <div className="absolute inset-0 grid place-items-center bg-color-for-layer-on-body/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-first" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
