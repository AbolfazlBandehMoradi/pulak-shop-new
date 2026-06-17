import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
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
} from "lucide-react";
import type { OrderDetail, OrderShippingAddress } from "@/types/order.types";
import { fetchProfileOrder } from "@/utils/profileOrderApi";
import {
  formatOrderDateTime,
  orderStatusTone,
  paymentStatusTone,
  resolveAddressFromJson,
  resolveShippingAddress,
  translateOrderStatus,
  translatePaymentStatus,
} from "@/utils/orderDetailHelpers";
import getImageUrl from "@/utils/getImageUrl";
import { useTranslation } from "@/i18n/useTranslation";
import { useLangStore } from "@/stores/languageStore";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderInvoicePrintButton } from "@/components/prints";

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
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-sm text-foreground ${mono ? "break-all font-mono text-xs sm:text-sm" : ""}`}
      >
        {value}
      </div>
    </div>
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
    address.fullName ||
    [address.firstName, address.lastName].filter(Boolean).join(" ") ||
    null;

  return (
    <div className="space-y-3 text-sm text-foreground">
      {address.title && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("profile.orders.addressTitle")}
          </div>
          <div className="mt-1 font-medium">{address.title}</div>
        </div>
      )}
      {displayName && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("profile.orders.name")}
          </div>
          <div className="mt-1 font-medium">{displayName}</div>
        </div>
      )}
      {address.phone && (
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2 dark:bg-gray-900/40">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="tabular-nums">{address.phone}</span>
        </div>
      )}
      {address.alternativePhone && (
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2 dark:bg-gray-900/40">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="tabular-nums">{address.alternativePhone}</span>
        </div>
      )}
      {address.addressLine1 && <div>{address.addressLine1}</div>}
      {address.addressLine2 && <div>{address.addressLine2}</div>}
      {(address.city || address.province || address.postalCode) && (
        <div>
          {[address.city, address.province].filter(Boolean).join(", ")}
          {address.postalCode ? ` — ${address.postalCode}` : ""}
        </div>
      )}
      {address.country && <div>{address.country}</div>}
      {address.additionalDetails && (
        <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-muted-foreground">
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

  const locale = currentLanguage === "fa" ? "fa-IR" : "en-US";
  const notAvailable = "—";

  const translateOr = useCallback(
    (key: string, fallback: string) => {
      const translated = t(key);
      return translated && translated !== key ? translated : fallback;
    },
    [t]
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
      console.error("Failed to load order:", err);
      const message =
        axios.isAxiosError(err) && err.response?.status === 404
          ? translateOr("profile.orders.notFound", "Order not found")
          : translateOr("profile.orderLoadError", "Failed to load order details");
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

  const shippingAddress = useMemo(
    () => (order ? resolveShippingAddress(order) : null),
    [order]
  );
  const billingAddress = useMemo(
    () => (order ? resolveAddressFromJson(order.billingAddressJson) : null),
    [order]
  );

  const savedDeliveryFee = order?.delivery?.baseCost ?? 0;
  const merchandiseSubtotalExShipping = order
    ? order.totalAmount - order.taxAmount + order.discountAmount - savedDeliveryFee
    : 0;

  const resolveImageUrl = (path: string) => getImageUrl(path) ?? path;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {translateOr("profile.orderDetails", "Order details")}
                </p>
                <h2 className="truncate text-xl font-bold">
                  {order?.orderNumber
                    ? `#${order.orderNumber}`
                    : orderId
                      ? `#${orderId}`
                      : "—"}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {order && (
                  <OrderInvoicePrintButton
                    order={order}
                    dir={dir}
                    locale={locale}
                    languageCode={currentLanguage}
                    t={t}
                    label={translateOr("profile.printInvoice", "Print invoice")}
                    resolveImageUrl={resolveImageUrl}
                    size="sm"
                    variant="outline"
                  />
                )}
                <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <Button className="mt-4" size="sm" onClick={() => void loadOrder()}>
                    {translateOr("common.retry", "Retry")}
                  </Button>
                </div>
              ) : order ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        icon: Package,
                        label: translateOr("profile.orders.orderStatus", "Order status"),
                        value: (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${orderStatusTone(order.orderStatus)}`}
                          >
                            {translateOrderStatus(order.orderStatus, t)}
                          </span>
                        ),
                      },
                      {
                        icon: CreditCard,
                        label: translateOr("profile.orders.paymentStatus", "Payment status"),
                        value: (
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${paymentStatusTone(order.paymentStatus)}`}
                          >
                            {translatePaymentStatus(order.paymentStatus, t)}
                          </span>
                        ),
                      },
                      {
                        icon: Receipt,
                        label: translateOr("profile.total", "Total"),
                        value: (
                          <PriceDisplay
                            amount={order.totalAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                            valueClassName="text-lg font-semibold"
                          />
                        ),
                      },
                      {
                        icon: Calendar,
                        label: translateOr("profile.date", "Date"),
                        value: formatOrderDateTime(order.createdAt, locale) ?? notAvailable,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl border bg-white p-4 dark:bg-gray-900/40"
                      >
                        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                        <div className="text-sm">{value}</div>
                      </div>
                    ))}
                  </div>

                  <section className="overflow-hidden rounded-xl border">
                    <div className="border-b bg-muted/40 px-4 py-3 dark:bg-gray-900/30">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        {translateOr("profile.orders.orderItems", "Order items")}
                        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border">
                          {order.items.length}
                        </span>
                      </h3>
                    </div>
                    {order.items.length === 0 ? (
                      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                        {translateOr("profile.orders.noItems", "No items in this order.")}
                      </p>
                    ) : (
                      <div className="divide-y">
                        {order.items.map((item) => {
                          const imgPath =
                            item.productImage?.thumbnailPath || item.productImage?.filePath;
                          return (
                            <div key={item.id} className="flex gap-4 px-4 py-4">
                              <div className="shrink-0 overflow-hidden rounded-lg border bg-muted/30">
                                {imgPath ? (
                                  <img
                                    src={resolveImageUrl(imgPath)}
                                    alt={item.productImage?.alt || item.itemName}
                                    className="h-16 w-16 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-16 w-16 items-center justify-center text-muted-foreground">
                                    <Package className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{item.itemName}</div>
                                <div className="mt-0.5 text-sm text-muted-foreground">
                                  {translateOr("profile.orders.sku", "SKU")}: {item.sku}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {translateOr("profile.orders.quantity", "Qty")}: {item.quantity}
                                </div>
                              </div>
                              <div className="shrink-0 text-end">
                                <div className="font-semibold">
                                  <PriceDisplay
                                    amount={item.total}
                                    currency={order.currencyCode || order.currencySymbol}
                                    currencyMode="symbol"
                                    languageCode={currentLanguage}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <PriceDisplay
                                    amount={item.unitPrice}
                                    currency={order.currencyCode || order.currencySymbol}
                                    currencyMode="symbol"
                                    languageCode={currentLanguage}
                                  />{" "}
                                  {translateOr("profile.orders.each", "each")}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="border-t bg-muted/20 px-4 py-4 dark:bg-gray-900/30">
                      <div className="ms-auto max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">
                            {translateOr("profile.orders.subtotal", "Subtotal")}
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
                            <span className="text-muted-foreground">
                              {translateOr("profile.orders.deliveryFee", "Delivery")}
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
                            <span className="text-muted-foreground">
                              {translateOr("profile.orders.discount", "Discount")}
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
                          <span className="text-muted-foreground">
                            {translateOr("profile.orders.tax", "Tax")}
                          </span>
                          <PriceDisplay
                            amount={order.taxAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                          />
                        </div>
                        <div className="flex justify-between gap-4 border-t pt-2 text-base font-bold">
                          <span>{translateOr("profile.total", "Total")}</span>
                          <PriceDisplay
                            amount={order.totalAmount}
                            currency={order.currencyCode || order.currencySymbol}
                            currencyMode="symbol"
                            languageCode={currentLanguage}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border p-4">
                      <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {translateOr("profile.orders.customer", "Customer")}
                      </h3>
                      {order.userName ? (
                        <div className="space-y-3 text-sm">
                          <DetailField
                            label={translateOr("profile.orders.name", "Name")}
                            value={order.userName}
                          />
                          {order.userEmail && (
                            <div className="flex items-start gap-2">
                              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                              <DetailField
                                label={translateOr("profile.orders.email", "Email")}
                                value={order.userEmail}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {translateOr("profile.orders.guest", "Guest customer")}
                        </p>
                      )}
                    </section>

                    <section className="rounded-xl border p-4">
                      <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        {translateOr("profile.orders.orderInfo", "Order information")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailField
                          label={translateOr("profile.orders.orderNumber", "Order number")}
                          value={order.orderNumber}
                          mono
                        />
                        <DetailField
                          label={translateOr("profile.orders.currencyCode", "Currency")}
                          value={`${order.currencyCode}${order.currencySymbol && order.currencySymbol !== order.currencyCode ? ` (${order.currencySymbol})` : ""}`}
                        />
                        <DetailField
                          label={translateOr("profile.orders.createdAt", "Created at")}
                          value={formatOrderDateTime(order.createdAt, locale) ?? notAvailable}
                        />
                        <DetailField
                          label={translateOr("profile.orders.completedAt", "Completed at")}
                          value={formatOrderDateTime(order.completedAt, locale) ?? notAvailable}
                        />
                      </div>
                    </section>

                    <section className="rounded-xl border p-4">
                      <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        {translateOr("profile.orders.shippingAddress", "Shipping address")}
                      </h3>
                      {shippingAddress ? (
                        <ShippingAddressCard address={shippingAddress} t={t} />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {translateOr(
                            "profile.orders.noShippingAddress",
                            "No shipping address on file."
                          )}
                        </p>
                      )}
                    </section>

                    <section className="rounded-xl border p-4">
                      <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        {translateOr("profile.orders.paymentInfo", "Payment information")}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailField
                          label={translateOr("profile.orders.paymentStatus", "Payment status")}
                          value={
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${paymentStatusTone(order.paymentStatus)}`}
                            >
                              {translatePaymentStatus(order.paymentStatus, t)}
                            </span>
                          }
                        />
                        <DetailField
                          label={translateOr("profile.orders.paidAt", "Paid at")}
                          value={formatOrderDateTime(order.paidAt, locale) ?? notAvailable}
                        />
                        {order.transactionReferenceId && (
                          <DetailField
                            label={translateOr(
                              "profile.orders.transactionReferenceId",
                              "Transaction reference"
                            )}
                            value={order.transactionReferenceId}
                            mono
                          />
                        )}
                      </div>
                    </section>

                    {order.delivery && (
                      <section className="rounded-xl border p-4 lg:col-span-2">
                        <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          {translateOr("profile.orders.deliveryInfo", "Delivery")}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="font-medium">
                            {order.delivery.localizedMethodName?.[currentLanguage] ||
                              order.delivery.localizedMethodName?.en ||
                              order.delivery.methodName}
                          </div>
                          {(order.delivery.baseCost ?? 0) > 0 && (
                            <PriceDisplay
                              amount={order.delivery.baseCost ?? 0}
                              currency={order.currencyCode || order.currencySymbol}
                              currencyMode="symbol"
                              languageCode={currentLanguage}
                            />
                          )}
                          {order.delivery.fieldDefinitions.length > 0 && (
                            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                              {order.delivery.fieldDefinitions.map((def) => (
                                <div
                                  key={def.key}
                                  className="rounded-lg border bg-muted/20 px-3 py-2"
                                >
                                  <dt className="text-xs text-muted-foreground">
                                    {def.label?.[currentLanguage] ||
                                      def.label?.en ||
                                      def.label?.fa ||
                                      def.key}
                                  </dt>
                                  <dd className="mt-0.5 font-medium">
                                    {order.delivery?.fieldValues[def.key] ?? notAvailable}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>
                      </section>
                    )}

                    {billingAddress && (
                      <section className="rounded-xl border p-4 lg:col-span-2">
                        <h3 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          {translateOr("profile.orders.billingAddress", "Billing address")}
                        </h3>
                        <ShippingAddressCard address={billingAddress} t={t} />
                      </section>
                    )}

                    {order.notes && (
                      <section className="rounded-xl border p-4 lg:col-span-2">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          {translateOr("profile.orders.notes", "Notes")}
                        </h3>
                        <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
                      </section>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
