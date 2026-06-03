import { ArrowUpRight, Clock3, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from '@/components/ui/Badge';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import {
  type CatalogProduct,
  getProductTranslation,
  isProductInStock,
} from '@/types/productView.types';
import { type Language } from '@/types';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import cleanText from '@/utils/cleanText';
import formatRating from '@/utils/formatRating';

type ProductCardProps = {
  product: CatalogProduct;
  lang: Language;
  getImageUrl: (product: CatalogProduct) => string | null;
};

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

type OfferCountdownProps = {
  lang: Language;
  saleEndDateUtc: string;
};

const getRemainingTime = (endAtMs: number): RemainingTime => {
  const difference = Math.max(endAtMs - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: difference === 0,
  };
};

const OfferCountdown = memo(function OfferCountdown({ lang, saleEndDateUtc }: OfferCountdownProps) {
  const endAtMs = useMemo(() => Date.parse(saleEndDateUtc), [saleEndDateUtc]);
  const intervalRef = useRef<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<RemainingTime | null>(() =>
    Number.isFinite(endAtMs) ? getRemainingTime(endAtMs) : null,
  );

  useEffect(() => {
    if (!Number.isFinite(endAtMs)) {
      setRemainingTime(null);
      return;
    }

    const updateTime = () => {
      const nextTime = getRemainingTime(endAtMs);
      setRemainingTime(nextTime);

      if (nextTime.isExpired && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    updateTime();
    intervalRef.current = window.setInterval(updateTime, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endAtMs]);

  if (!remainingTime) {
    return null;
  }

  const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
  const numberFormatter = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const offerLabel =
    lang === 'fa'
      ? '\u067e\u0627\u06cc\u0627\u0646 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f'
      : 'Offer ends in';
  const expiredLabel =
    lang === 'fa'
      ? '\u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0628\u0647 \u067e\u0627\u06cc\u0627\u0646 \u0631\u0633\u06cc\u062f'
      : 'Offer ended';
  const units = [
    { key: lang === 'fa' ? '\u0631\u0648\u0632' : 'd', value: remainingTime.days },
    { key: lang === 'fa' ? '\u0633' : 'h', value: remainingTime.hours },
    { key: lang === 'fa' ? '\u062f' : 'm', value: remainingTime.minutes },
    { key: lang === 'fa' ? '\u062b' : 's', value: remainingTime.seconds },
  ];

  return (
    <div className="mt-2 rounded-lg border border-third/35 bg-third/10 px-2.5 py-1.5">
      <div className="flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5 text-first" />
        <span className="text-[11px] font-s-medium first-text-color-for-paragraph">
          {remainingTime.isExpired ? expiredLabel : offerLabel}
        </span>
        <div className="ms-auto flex items-center gap-1">
          {units.map((unit) => (
            <span
              key={unit.key}
              className="inline-flex items-center gap-0.5 rounded bg-first/90 px-1.5 py-0.5 text-[10px] font-s-medium text-white"
            >
              <span>{numberFormatter.format(unit.value)}</span>
              <span className="opacity-85">{unit.key}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function ProductCard({ product, lang, getImageUrl }: ProductCardProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const labels = {
    freeShipping:
      lang === 'fa'
        ? '\u0627\u0631\u0633\u0627\u0644 \u0631\u0627\u06cc\u06af\u0627\u0646'
        : 'Free shipping',
    unavailableImage:
      lang === 'fa' ? '\u062a\u0635\u0648\u06cc\u0631 \u0646\u062f\u0627\u0631\u062f' : 'No image',
  };

  const translation = getProductTranslation(product, lang);
  const inStock = isProductInStock(product);
  const imageUrl = getImageUrl(product);

  const localizedPrice = useMemo(
    () => product.prices.find((price) => price.languageCode === lang) ?? product.prices[0],
    [lang, product.prices],
  );

  const basePrice = useMemo(
    () => localizedPrice?.originalPrice ?? localizedPrice?.price ?? product.price ?? 0,
    [localizedPrice, product.price],
  );

  const salePrice = useMemo(() => {
    if (typeof localizedPrice?.salePrice === 'number') {
      return localizedPrice.salePrice;
    }

    if (typeof product.salePrice === 'number') {
      return product.salePrice;
    }

    return null;
  }, [localizedPrice?.salePrice, product.salePrice]);

  const hasDiscount =
    typeof salePrice === 'number' &&
    typeof basePrice === 'number' &&
    basePrice > 0 &&
    salePrice > 0 &&
    salePrice < basePrice;

  const currentPrice = hasDiscount ? salePrice : (localizedPrice?.price ?? product.price ?? 0);
  const originalPrice = hasDiscount ? basePrice : undefined;

  const discount = useMemo(() => {
    if (typeof localizedPrice?.discountPercent === 'number') {
      return localizedPrice.discountPercent;
    }

    if (typeof product.discountPercent === 'number') {
      return product.discountPercent;
    }

    if (hasDiscount) {
      return Math.round(((basePrice - currentPrice) / basePrice) * 100);
    }

    return undefined;
  }, [
    localizedPrice?.discountPercent,
    product.discountPercent,
    hasDiscount,
    basePrice,
    currentPrice,
  ]);

  const showOfferTimer =
    hasDiscount &&
    Boolean(localizedPrice?.saleEndDateUtc) &&
    (product.isOnSale || localizedPrice?.isSaleActive || localizedPrice?.hasSalePrice);
  return (
    <article className="group relative flex min-h-80 sm:min-h-88 flex-col overflow-hidden rounded-2xl border border-first-100/70 bg-color-for-layer-on-body p-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.5)]  transition-all duration-300 hover:-translate-y-1 hover:border-first-300 hover:shadow-[0_16px_36px_-20px_rgba(27,126,251,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(27,126,251,0.09),transparent_52%)]" />
      <div className="relative overflow-hidden h-40 w-full rounded-xl border border-first-100/70 bg-color-for-layer-sec">
        <Link
          to={localizedPath(`/products/${product.slug}`)}
          className="h-full w-full z-1 overflow-hidden flex justify-center items-center"
          aria-label={translation?.name ?? product.name}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(27,126,251,0.14),rgba(16,185,129,0.08))]" />
          <div className="pointer-events-none absolute -left-8 -top-8 h-20 w-20 rounded-full bg-first/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-third/20 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.35),transparent_40%)]" />
          {imageUrl ? (
            <img
              src={imageUrl}
              className="relative z-10 h-full w-full object-contain p-3 drop-shadow-[0_12px_20px_rgba(15,23,42,0.2)] transition-transform duration-500 group-hover:scale-105"
              alt={translation?.name ?? product.name}
              loading="lazy"
            />
          ) : (
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 first-text-color-for-paragraph">
              <ImageOff className="h-8 w-8 opacity-70" />
              <span className="text-xs">{labels.unavailableImage}</span>
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2">
          {typeof discount === 'number' && discount > 0 ? (
            <span
              className="relative right-1 flex flex-col items-end  after:absolute after:left-full pr-1 after:h-full after:w-0.75 after:rounded-4xl
                after:rounded-tr-none after:rounded-br-none after:bg-secound  "
            >
              <span className="text-xs font-bold  inline-block w-full  text-start text-secound">
                {discount}
              </span>
              <span className="text-xs inline-block w-full  first-text-color-for-paragraph">
                {t('mainpage.specials.discountBadge')}
              </span>
            </span>
          ) : (
            <span />
          )}
          {!inStock && (
            <Badge className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
              {t('productsFilter.outOfStock')}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="font-s-medium text-base mt-2 mb-1 first-text-color  ">
            {translation?.name ?? product.name}
          </h2>
          <p className="font-f-light first-text-color-for-paragraph text-sm line-clamp-2">
            {cleanText(translation?.description ?? '')}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col relative justify-between">
            {typeof originalPrice === 'number' && originalPrice > currentPrice ? (
              <>
                <h4 className="text-sm   opacity-70 first-text-color-for-paragraph">
                  <PriceDisplay
                    currency={localizedPrice?.currencyCode ?? product.currencyCode}
                    amount={originalPrice}
                    currencyMode="none"
                    variant="secondary"
                    languageCode={lang}
                  />
                  <span className="bg-color-for-red absolute h-0.5 w-60/96 opacity-30 rotate-15 top-2 left-2 right-0"></span>
                </h4>
                <span className="text-sm flex items-center">
                  <span className="h-2 leading-4 pe-1 font-sm-bold first-text-color-for-paragraph  text-base">
                    <PriceDisplay
                      amount={currentPrice}
                      currency={localizedPrice?.currencyCode ?? product.currencyCode}
                      currencyMode="none"
                      languageCode={lang}
                      variant="secondary"
                    />
                  </span>
                  <span className="first-text-color-svg">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 18 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.60758 17C3.14758 17 2.76424 16.9633 2.45758 16.89C2.15758 16.81 1.91758 16.6567 1.73758 16.43C1.55758 16.2033 1.46091 15.8733 1.44758 15.44L1.31758 10.6L2.15758 10.5V15.31C2.15758 15.4833 2.19758 15.62 2.27758 15.72C2.35758 15.82 2.50091 15.8933 2.70758 15.94C2.91424 15.9867 3.21424 16.01 3.60758 16.01L3.70758 16.11V16.9L3.60758 17ZM7.47352 17.03C7.26018 17.03 6.97018 16.9933 6.60352 16.92C6.23685 16.84 5.90352 16.7333 5.60352 16.6C5.30352 16.46 5.13352 16.3033 5.09352 16.13C5.07352 16.05 5.06352 15.96 5.06352 15.86C5.06352 15.7067 5.08685 15.55 5.13352 15.39C5.41352 15.57 5.81018 15.7267 6.32352 15.86C6.84352 15.9867 7.38685 16.0633 7.95352 16.09V13.92H6.65352C6.24685 13.92 5.99018 14.16 5.88352 14.64L5.64352 15.71C5.55018 16.1367 5.34685 16.46 5.03352 16.68C4.72018 16.8933 4.35685 17 3.94352 17H3.60352V16.01H3.93352C4.26685 16.01 4.51018 15.9733 4.66352 15.9C4.82352 15.8267 4.93352 15.7167 4.99352 15.57C5.06018 15.4233 5.13018 15.1767 5.20352 14.83L5.35352 14.14C5.44018 13.7533 5.62685 13.4633 5.91352 13.27C6.20018 13.0767 6.56352 12.98 7.00352 12.98H8.59352V15.96C8.59352 16.3533 8.49685 16.63 8.30352 16.79C8.11018 16.95 7.83352 17.03 7.47352 17.03ZM12.9376 17.14C12.9376 16.28 12.9076 15.6467 12.8476 15.24C12.7942 14.8267 12.6442 14.5067 12.3976 14.28C12.1576 14.0467 11.7642 13.93 11.2176 13.93H10.8576L10.6776 16C10.8509 16.04 11.1709 16.06 11.6376 16.06C12.0776 16.0533 12.6209 16.0333 13.2676 16V16.93C13.2076 16.93 13.1409 16.9333 13.0676 16.94C13.0009 16.9467 12.9276 16.9533 12.8476 16.96C12.2942 17.02 11.8142 17.05 11.4076 17.05C10.9876 17.05 10.6542 16.9733 10.4076 16.82C10.1609 16.66 10.0376 16.3833 10.0376 15.99C10.0376 15.8967 10.0409 15.8267 10.0476 15.78L10.3376 12.98H11.1976C11.8576 12.98 12.3576 13.1133 12.6976 13.38C13.0442 13.6467 13.2776 14.0233 13.3976 14.51C13.5176 14.9967 13.5776 15.6333 13.5776 16.42L12.9376 17.14ZM10.0576 18.22C11.5042 18.0467 12.4642 17.7333 12.9376 17.28V16.36C12.9376 16.3067 12.9842 16.24 13.0776 16.16C13.1776 16.0733 13.2709 16.03 13.3576 16.03C13.5042 16.03 13.5776 16.16 13.5776 16.42C13.5776 16.9467 13.5142 17.37 13.3876 17.69C13.2676 18.0167 12.9642 18.31 12.4776 18.57C11.9976 18.83 11.2476 19.0333 10.2276 19.18L10.0576 18.22ZM13.3076 16.01H14.5076L14.6076 16.11V16.9L14.5076 17H13.3076V16.01ZM14.5117 16.01C14.7851 16.01 15.0851 15.99 15.4117 15.95C15.7384 15.91 15.9684 15.8467 16.1017 15.76L15.9917 13.03L16.8417 12.98V15.3C16.8417 15.92 16.6451 16.36 16.2517 16.62C15.8584 16.8733 15.2784 17 14.5117 17V16.01ZM15.9217 11.08V12H14.7317V11.08H15.9217ZM17.1017 11.08V12H15.9217V11.08H17.1017Z"
                        fill="currentColor"
                      />
                      <path
                        d="M5.7043 10.33C4.1843 10.33 3.4243 9.67333 3.4243 8.36C3.4243 8.13333 3.47096 7.4 3.5643 6.16L4.2143 6.21C4.16096 7.21 4.1343 7.86667 4.1343 8.18C4.1343 8.63333 4.28096 8.94 4.5743 9.1C4.8743 9.26 5.2743 9.34 5.7743 9.34C6.24763 9.34 6.6943 9.29 7.1143 9.19C7.54096 9.09 7.87763 8.97 8.1243 8.83L8.0143 5.5L8.8443 5.41V8.46C8.8443 8.86 8.69763 9.2 8.4043 9.48C8.11096 9.76667 7.7243 9.98 7.2443 10.12C6.77096 10.26 6.25763 10.33 5.7043 10.33ZM6.5543 5.13V6.14H5.5843V5.13H6.5543Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </span>
              </>
            ) : (
              <span className="text-sm flex items-center">
                <span className="h-2 leading-4 first-text-color-for-paragraph text-base pe-1">
                  <PriceDisplay
                    amount={currentPrice}
                    currency={localizedPrice?.currencyCode ?? product.currencyCode}
                    currencyMode="none"
                    languageCode={lang}
                    variant="secondary"
                  />
                </span>
                <span className="first-text-color-svg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 18 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.60758 17C3.14758 17 2.76424 16.9633 2.45758 16.89C2.15758 16.81 1.91758 16.6567 1.73758 16.43C1.55758 16.2033 1.46091 15.8733 1.44758 15.44L1.31758 10.6L2.15758 10.5V15.31C2.15758 15.4833 2.19758 15.62 2.27758 15.72C2.35758 15.82 2.50091 15.8933 2.70758 15.94C2.91424 15.9867 3.21424 16.01 3.60758 16.01L3.70758 16.11V16.9L3.60758 17ZM7.47352 17.03C7.26018 17.03 6.97018 16.9933 6.60352 16.92C6.23685 16.84 5.90352 16.7333 5.60352 16.6C5.30352 16.46 5.13352 16.3033 5.09352 16.13C5.07352 16.05 5.06352 15.96 5.06352 15.86C5.06352 15.7067 5.08685 15.55 5.13352 15.39C5.41352 15.57 5.81018 15.7267 6.32352 15.86C6.84352 15.9867 7.38685 16.0633 7.95352 16.09V13.92H6.65352C6.24685 13.92 5.99018 14.16 5.88352 14.64L5.64352 15.71C5.55018 16.1367 5.34685 16.46 5.03352 16.68C4.72018 16.8933 4.35685 17 3.94352 17H3.60352V16.01H3.93352C4.26685 16.01 4.51018 15.9733 4.66352 15.9C4.82352 15.8267 4.93352 15.7167 4.99352 15.57C5.06018 15.4233 5.13018 15.1767 5.20352 14.83L5.35352 14.14C5.44018 13.7533 5.62685 13.4633 5.91352 13.27C6.20018 13.0767 6.56352 12.98 7.00352 12.98H8.59352V15.96C8.59352 16.3533 8.49685 16.63 8.30352 16.79C8.11018 16.95 7.83352 17.03 7.47352 17.03ZM12.9376 17.14C12.9376 16.28 12.9076 15.6467 12.8476 15.24C12.7942 14.8267 12.6442 14.5067 12.3976 14.28C12.1576 14.0467 11.7642 13.93 11.2176 13.93H10.8576L10.6776 16C10.8509 16.04 11.1709 16.06 11.6376 16.06C12.0776 16.0533 12.6209 16.0333 13.2676 16V16.93C13.2076 16.93 13.1409 16.9333 13.0676 16.94C13.0009 16.9467 12.9276 16.9533 12.8476 16.96C12.2942 17.02 11.8142 17.05 11.4076 17.05C10.9876 17.05 10.6542 16.9733 10.4076 16.82C10.1609 16.66 10.0376 16.3833 10.0376 15.99C10.0376 15.8967 10.0409 15.8267 10.0476 15.78L10.3376 12.98H11.1976C11.8576 12.98 12.3576 13.1133 12.6976 13.38C13.0442 13.6467 13.2776 14.0233 13.3976 14.51C13.5176 14.9967 13.5776 15.6333 13.5776 16.42L12.9376 17.14ZM10.0576 18.22C11.5042 18.0467 12.4642 17.7333 12.9376 17.28V16.36C12.9376 16.3067 12.9842 16.24 13.0776 16.16C13.1776 16.0733 13.2709 16.03 13.3576 16.03C13.5042 16.03 13.5776 16.16 13.5776 16.42C13.5776 16.9467 13.5142 17.37 13.3876 17.69C13.2676 18.0167 12.9642 18.31 12.4776 18.57C11.9976 18.83 11.2476 19.0333 10.2276 19.18L10.0576 18.22ZM13.3076 16.01H14.5076L14.6076 16.11V16.9L14.5076 17H13.3076V16.01ZM14.5117 16.01C14.7851 16.01 15.0851 15.99 15.4117 15.95C15.7384 15.91 15.9684 15.8467 16.1017 15.76L15.9917 13.03L16.8417 12.98V15.3C16.8417 15.92 16.6451 16.36 16.2517 16.62C15.8584 16.8733 15.2784 17 14.5117 17V16.01ZM15.9217 11.08V12H14.7317V11.08H15.9217ZM17.1017 11.08V12H15.9217V11.08H17.1017Z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.7043 10.33C4.1843 10.33 3.4243 9.67333 3.4243 8.36C3.4243 8.13333 3.47096 7.4 3.5643 6.16L4.2143 6.21C4.16096 7.21 4.1343 7.86667 4.1343 8.18C4.1343 8.63333 4.28096 8.94 4.5743 9.1C4.8743 9.26 5.2743 9.34 5.7743 9.34C6.24763 9.34 6.6943 9.29 7.1143 9.19C7.54096 9.09 7.87763 8.97 8.1243 8.83L8.0143 5.5L8.8443 5.41V8.46C8.8443 8.86 8.69763 9.2 8.4043 9.48C8.11096 9.76667 7.7243 9.98 7.2443 10.12C6.77096 10.26 6.25763 10.33 5.7043 10.33ZM6.5543 5.13V6.14H5.5843V5.13H6.5543Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center justify-start gap-1 border-r-gray-300 border-r pr-1 ">
            <span className="text-xs first-text-color-for-paragraph">
              {formatRating(product.rating || 0)}
            </span>
            <span className="text-xs first-text-color-for-paragraph">
              {t('mainpage.specials.ratingOutOf')}
            </span>
            <span className="text-xs first-text-color-for-paragraph">5</span>
            <span className=" w-4 h-4">
              <svg
                className="text-amber-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5095 17.7915C12.1888 17.6289 11.8112 17.6289 11.4905 17.7915L7.37943 19.8751C6.50876 20.3164 5.52842 19.5193 5.76452 18.562L6.72576 14.6645C6.81767 14.2918 6.72079 13.8972 6.46729 13.6117L3.29416 10.0378C2.66165 9.32543 3.11095 8.18715 4.05367 8.11364L8.48026 7.76848C8.89433 7.73619 9.25828 7.47809 9.43013 7.09485L10.9627 3.67703C11.3675 2.77432 12.6325 2.77432 13.0373 3.67703L14.5699 7.09485C14.7417 7.47809 15.1057 7.73619 15.5197 7.76848L19.9463 8.11364C20.889 8.18715 21.3384 9.32543 20.7058 10.0378L17.5327 13.6117C17.2792 13.8972 17.1823 14.2918 17.2742 14.6645L18.2355 18.562C18.4716 19.5193 17.4912 20.3164 16.6206 19.8751L12.5095 17.7915Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
        <div>
          <Link
            to={localizedPath(`/products/${product.slug}`)}
            className="bg-first flex justify-between text-center overflow-hidden p-2 rounded-md text-white group"
          >
            <span className="text-base w-21/24 font-s-regular">
              {t('mainpage.specials.viewProduct')}
            </span>
            <span
              className="
          relative flex justify-center w-3/24
          before:content-[''] after:content-['']
          before:absolute after:absolute
          before:w-2 before:h-2 after:w-2 after:h-2
          circle-in-button-card
          before:rounded-full after:rounded-full
          before:-top-3 before:-right-3
          after:-bottom-3 after:-right-3
          before:opacity-100 after:opacity-100
          before:transition-opacity after:transition-opacity
          before:duration-300 after:duration-300
          group-hover:before:opacity-0 group-hover:after:opacity-0
        "
            >
              <svg
                width="12"
                height="24"
                viewBox="0 0 12 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z"
                  fill="white"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </article>
    //     {showOfferTimer && localizedPrice?.saleEndDateUtc && (
    //   <OfferCountdown lang={lang} saleEndDateUtc={localizedPrice.saleEndDateUtc} />
    // )}
  );
}
