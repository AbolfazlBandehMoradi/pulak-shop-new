import { forwardRef, useLayoutEffect, useRef, type ReactNode } from "react";
import JsBarcode from "jsbarcode";
import type { OrderDetail } from "@/types/order.types";
import type { OrderInvoiceSellerInfo } from "./types";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { cn } from "@/utils/cn";
import {
  translateOrderStatus,
  translatePaymentStatus,
} from "@/utils/orderDetailHelpers";

function parseAddress(json?: string): Record<string, string> | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return null;
  }
}

function formatTemplate(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

export interface OrderInvoiceDocumentProps {
  order: OrderDetail;
  dir: "ltr" | "rtl";
  locale: string;
  languageCode: string;
  t: (key: string) => string;
  seller?: OrderInvoiceSellerInfo;
  resolveImageUrl: (path: string) => string;
}

const headerCell =
  "border border-slate-300 bg-sky-100 px-1 py-1 text-[10px] font-semibold text-slate-900 [print-color-adjust:exact]";

const bodyCell =
  "border border-slate-300 px-1 py-1 text-[10px] text-slate-900 align-middle leading-tight";

function CompactSection(props: {
  dir: "ltr" | "rtl";
  title: string;
  children: ReactNode;
}) {
  const { dir, title, children } = props;
  return (
    <div
      className="grid min-h-0 grid-cols-[1.35rem_1fr] gap-0 overflow-hidden rounded border border-slate-300 bg-white [print-color-adjust:exact]"
      dir={dir}
    >
      <div
        className="flex items-center justify-center border-slate-300 border-e bg-sky-100 py-1 text-[9px] font-bold leading-none text-slate-800 [print-color-adjust:exact]"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        {title}
      </div>
      <div className="px-1.5 py-1">{children}</div>
    </div>
  );
}

function FieldRow(props: { label: string; value: string }) {
  return (
    <div className="mb-1 leading-tight last:mb-0">
      <div className="text-[8px] font-medium text-slate-500">{props.label}</div>
      <div className="break-words text-[9px] font-medium text-slate-900">{props.value}</div>
    </div>
  );
}

export const OrderInvoiceDocument = forwardRef<HTMLDivElement, OrderInvoiceDocumentProps>(
  function OrderInvoiceDocument(props, ref) {
    const { order, dir, locale, languageCode, t, seller, resolveImageUrl } = props;
    const trackingRef = useRef<SVGSVGElement>(null);
    const invoiceBarcodeRef = useRef<SVGSVGElement>(null);

    const na = t("profile.invoice.notAvailable");
    const df = new Intl.DateTimeFormat(locale || undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });

    const money = (amount: number, className?: string) => (
      <PriceDisplay
        amount={amount}
        currency={order.currencyCode || order.currencySymbol}
        currencyMode="symbol"
        languageCode={languageCode}
        className={className}
      />
    );

    const shipping = parseAddress(order.shippingAddressJson);
    const buyerName =
      shipping?.fullName || order.userName || t("profile.orders.guest");
    const addrLines = [
      shipping?.addressLine1,
      shipping?.addressLine2,
      [shipping?.city, shipping?.state, shipping?.postalCode].filter(Boolean).join(" "),
      shipping?.country,
    ]
      .filter(Boolean)
      .join(" — ");

    const savedDeliveryFee = order.delivery?.baseCost ?? 0;
    const subtotal =
      order.totalAmount - order.taxAmount + order.discountAmount - savedDeliveryFee;

    const orderStatusLabel = translateOrderStatus(order.orderStatus, t);
    const paymentStatusLabel = translatePaymentStatus(order.paymentStatus, t);
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

    const settlementDate =
      order.paymentStatus === "Paid" && order.updatedAt
        ? df.format(new Date(order.updatedAt))
        : na;

    useLayoutEffect(() => {
      const tracking = trackingRef.current;
      const inv = invoiceBarcodeRef.current;
      if (!tracking || !inv) return;
      try {
        tracking.replaceChildren();
        inv.replaceChildren();
        JsBarcode(tracking, order.orderNumber, {
          format: "CODE128",
          width: 1,
          height: 26,
          displayValue: false,
          margin: 2,
          background: "#ffffff",
          lineColor: "#0f172a",
        });
        JsBarcode(inv, order.orderNumber, {
          format: "CODE128",
          width: 1,
          height: 28,
          displayValue: true,
          fontSize: 8,
          margin: 2,
          background: "#ffffff",
          lineColor: "#0f172a",
        });
      } catch {
        /* ignore barcode render errors */
      }
    }, [order.orderNumber]);

    return (
      <div
        ref={ref}
        dir={dir}
        className={cn(
          "w-[210mm] max-w-full bg-white p-3 text-slate-900 shadow-none",
          "text-[11px] leading-tight [print-color-adjust:exact]"
        )}
      >
        <header
          dir={dir}
          className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2"
        >
          <div className="min-w-0 flex-1 text-start">
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              {formatTemplate(t("profile.invoice.title"), { number: order.orderNumber })}
            </h1>
          </div>
          <div className="flex shrink-0 flex-nowrap items-end gap-3">
            <div className="text-center">
              <div className="mb-0.5 text-[8px] font-medium leading-none text-slate-600">
                {t("profile.invoice.shipmentTrackingCode")}
              </div>
              <svg ref={trackingRef} className="mx-auto block h-9 w-32" />
            </div>
            <div className="text-center">
              <div className="mb-0.5 text-[8px] font-medium leading-none text-slate-600">
                {t("profile.invoice.invoiceNumberLabel")}
              </div>
              <svg ref={invoiceBarcodeRef} className="mx-auto block h-10 w-36" />
              <div className="mt-0.5 font-mono text-[9px] font-semibold leading-none">
                {order.orderNumber}
              </div>
            </div>
          </div>
        </header>

        <div
          className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3 print:grid-cols-3"
          dir={dir}
        >
          <CompactSection dir={dir} title={t("profile.invoice.sectionSeller")}>
            <FieldRow
              label={t("profile.invoice.companyAddress")}
              value={seller?.companyAddress || na}
            />
            <FieldRow label={t("profile.invoice.postalCode")} value={seller?.postalCode || na} />
            <FieldRow label={t("profile.invoice.phoneFax")} value={seller?.phone || na} />
          </CompactSection>
          <CompactSection dir={dir} title={t("profile.invoice.sectionBuyer")}>
            <FieldRow label={t("profile.invoice.buyerName")} value={buyerName} />
            <FieldRow label={t("profile.invoice.address")} value={addrLines || na} />
            <FieldRow
              label={t("profile.invoice.postalCode")}
              value={shipping?.postalCode || na}
            />
            <FieldRow label={t("profile.invoice.email")} value={order.userEmail || na} />
            <FieldRow label={t("profile.invoice.contactNumber")} value={shipping?.phone || na} />
          </CompactSection>
          <CompactSection dir={dir} title={t("profile.invoice.sectionDetails")}>
            <FieldRow
              label={t("profile.invoice.purchaseDate")}
              value={df.format(new Date(order.createdAt))}
            />
            <FieldRow label={t("profile.invoice.settlementDate")} value={settlementDate} />
            <FieldRow label={t("profile.invoice.orderStatus")} value={orderStatusLabel} />
            <FieldRow
              label={t("profile.invoice.orderCompletionDate")}
              value={order.completedAt ? df.format(new Date(order.completedAt)) : na}
            />
            <FieldRow label={t("profile.invoice.paymentMethod")} value={paymentStatusLabel} />
            <FieldRow label={t("profile.invoice.paymentReceipt")} value={order.orderNumber} />
          </CompactSection>
        </div>

        <div className="mb-2 overflow-x-auto rounded border border-slate-300" dir={dir}>
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr>
                <th className={headerCell}>{t("profile.invoice.colRow")}</th>
                <th className={cn(headerCell, "w-16")}>{t("profile.invoice.colImage")}</th>
                <th className={headerCell}>{t("profile.invoice.colDescription")}</th>
                <th className={cn(headerCell, "w-12")}>{t("profile.invoice.colQuantity")}</th>
                <th className={cn(headerCell, "w-24")}>{t("profile.invoice.colUnitPrice")}</th>
                <th className={cn(headerCell, "w-20")}>{t("profile.invoice.colDiscount")}</th>
                <th className={cn(headerCell, "w-24")}>{t("profile.invoice.colLineTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const lineGross = item.unitPrice * item.quantity;
                const discVal = lineGross - item.total;
                const discShow =
                  discVal > 0.005 ? money(discVal, "text-end tabular-nums") : na;
                const imgPath =
                  item.productImage?.thumbnailPath || item.productImage?.filePath;
                return (
                  <tr key={item.id}>
                    <td className={cn(bodyCell, "text-center")}>{idx + 1}</td>
                    <td className={bodyCell}>
                      {imgPath ? (
                        <img
                          src={resolveImageUrl(imgPath)}
                          alt=""
                          className="mx-auto h-9 w-9 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">{na}</span>
                      )}
                    </td>
                    <td className={bodyCell}>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="mt-0.5 text-[8px] text-slate-600">
                        {t("profile.orders.sku")}: {item.sku}
                        {item.productVariantId
                          ? ` · ${t("profile.orders.variant")}: ${item.productVariantId}`
                          : ""}
                      </div>
                    </td>
                    <td className={cn(bodyCell, "text-center")}>{item.quantity}</td>
                    <td className={cn(bodyCell, "text-end")}>
                      {money(item.unitPrice, "tabular-nums")}
                    </td>
                    <td className={cn(bodyCell, "text-end")}>{discShow}</td>
                    <td className={cn(bodyCell, "text-end font-medium")}>
                      {money(item.total, "tabular-nums")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="mb-2 flex flex-wrap items-stretch justify-between gap-2"
          dir={dir}
        >
          <div className="min-w-[10rem] flex-1 rounded border border-slate-300 bg-slate-50 px-2 py-1.5 [print-color-adjust:exact]">
            <div className="mb-0.5 flex justify-between text-[9px] leading-tight">
              <span className="text-slate-600">{t("profile.invoice.summarySubtotal")}</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
            {savedDeliveryFee > 0 && (
              <div className="mb-0.5 flex justify-between text-[9px] leading-tight">
                <span className="text-slate-600">{t("profile.orders.deliveryFee")}</span>
                <span className="font-medium">{money(savedDeliveryFee)}</span>
              </div>
            )}
            <div className="mb-0.5 flex justify-between text-[9px] leading-tight">
              <span className="text-slate-600">{t("profile.orders.tax")}</span>
              {money(order.taxAmount)}
            </div>
            {order.discountAmount > 0 && (
              <div className="mb-0.5 flex justify-between text-[9px] leading-tight">
                <span className="text-slate-600">{t("profile.orders.discount")}</span>
                {money(-order.discountAmount, "text-emerald-700")}
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 text-[10px] font-bold leading-tight">
              <span>{t("profile.invoice.summaryFinal")}</span>
              {money(order.totalAmount)}
            </div>
            <div className="mt-1 flex justify-between text-[8px] leading-tight text-slate-600">
              <span>{t("profile.invoice.paymentMethod")}</span>
              <span>{paymentStatusLabel}</span>
            </div>
          </div>
          <div className="flex min-w-[6rem] shrink-0 flex-col items-center justify-center rounded border border-slate-300 bg-sky-50 px-2 py-1.5 text-center [print-color-adjust:exact]">
            <div className="text-[8px] font-medium leading-none text-slate-600">
              {t("profile.invoice.totalQuantityLabel")}
            </div>
            <div className="mt-0.5 text-sm font-bold leading-none text-slate-900">
              {formatTemplate(t("profile.invoice.totalQuantityValue"), {
                count: String(totalQty),
              })}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-1.5 border-t border-slate-200 pt-1.5 sm:grid-cols-2 print:grid-cols-2"
          dir={dir}
        >
          <div className="rounded border border-slate-200 px-1.5 py-1">
            <div className="mb-0.5 text-[9px] font-semibold leading-none text-slate-700">
              {t("profile.invoice.storeManagerNote")}
            </div>
            <div className="min-h-[2rem] whitespace-pre-wrap text-[9px] leading-snug text-slate-800">
              {na}
            </div>
          </div>
          <div className="rounded border border-slate-200 px-1.5 py-1">
            <div className="mb-0.5 text-[9px] font-semibold leading-none text-slate-700">
              {t("profile.invoice.customerNote")}
            </div>
            <div className="min-h-[2rem] whitespace-pre-wrap text-[9px] leading-snug text-slate-800">
              {order.notes?.trim() ? order.notes : na}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderInvoiceDocument.displayName = "OrderInvoiceDocument";
