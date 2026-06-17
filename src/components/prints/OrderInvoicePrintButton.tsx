import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Loader2, Printer } from "lucide-react";
import type { OrderDetail } from "@/types/order.types";
import { Button } from "@/components/ui/Button";
import { OrderInvoiceDocument } from "./OrderInvoiceDocument";
import type { OrderInvoiceSellerInfo } from "./types";

export interface OrderInvoicePrintButtonProps {
  order: OrderDetail | null;
  loading?: boolean;
  onRequestOrder?: () => Promise<OrderDetail | null>;
  dir: "ltr" | "rtl";
  locale: string;
  languageCode: string;
  t: (key: string) => string;
  label: string;
  seller?: OrderInvoiceSellerInfo;
  resolveImageUrl: (path: string) => string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function OrderInvoicePrintButton({
  order,
  loading = false,
  onRequestOrder,
  dir,
  locale,
  languageCode,
  t,
  label,
  seller,
  resolveImageUrl,
  className,
  variant = "outline",
  size = "sm",
}: OrderInvoicePrintButtonProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printOrder, setPrintOrder] = useState<OrderDetail | null>(order);
  const [fetching, setFetching] = useState(false);
  const pendingPrintRef = useRef(false);

  useEffect(() => {
    if (order) {
      setPrintOrder(order);
    }
  }, [order]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printOrder ? `${printOrder.orderNumber}-invoice` : "invoice",
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  useEffect(() => {
    if (!printOrder || !pendingPrintRef.current) return;
    pendingPrintRef.current = false;
    const timer = window.setTimeout(() => handlePrint(), 50);
    return () => window.clearTimeout(timer);
  }, [handlePrint, printOrder]);

  const onClick = async () => {
    let targetOrder = order ?? printOrder;
    if (!targetOrder && onRequestOrder) {
      setFetching(true);
      try {
        targetOrder = await onRequestOrder();
      } finally {
        setFetching(false);
      }
    }
    if (!targetOrder) return;

    if (targetOrder.id !== printOrder?.id) {
      pendingPrintRef.current = true;
      setPrintOrder(targetOrder);
      return;
    }

    handlePrint();
  };

  const activeOrder = printOrder ?? order;
  const isBusy = loading || fetching;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => void onClick()}
        disabled={isBusy}
      >
        {isBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        <span className="ms-2">{label}</span>
      </Button>
      {activeOrder && (
        <div
          className="pointer-events-none fixed start-[-3000px] top-0 -z-[100] w-[210mm] max-w-[100vw] opacity-0"
          aria-hidden
        >
          <OrderInvoiceDocument
            ref={printRef}
            order={activeOrder}
            dir={dir}
            locale={locale}
            languageCode={languageCode}
            t={t}
            seller={seller}
            resolveImageUrl={resolveImageUrl}
          />
        </div>
      )}
    </>
  );
}
