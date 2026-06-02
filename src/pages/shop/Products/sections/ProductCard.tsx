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
  console.log(product);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-first-100/70 bg-color-for-layer-on-body p-2.5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-first-300 hover:shadow-[0_16px_36px_-20px_rgba(27,126,251,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(27,126,251,0.09),transparent_52%)]" />
      <div className="relative overflow-hidden rounded-xl border border-first-100/70 bg-color-for-layer-sec">
        <Link
          to={localizedPath(`/products/${product.slug}`)}
          className="block aspect-4/3 w-full"
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
            <div className="rounded-full bg-first px-2 py-0.5 text-[10px] font-s-medium text-white shadow-sm">
              -{discount}%
            </div>
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

      <div className="relative mt-3 flex flex-1 flex-col">
        <Link to={localizedPath(`/products/${product.slug}`)} className="group/title">
          <h3 className="line-clamp-2 min-h-[2.9rem] text-[15px] font-s-medium leading-[1.45] first-text-color transition-colors group-hover/title:text-first">
            {translation?.name ?? product.name}
          </h3>
        </Link>
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <p
            className={`font-f-light first-text-color-for-paragraph text-sm line-clamp-2 ${
              lang === 'fa' ? 'text-right' : 'text-left'
            }`}
          >
            {cleanText(translation?.description ?? '')}
          </p>
          <div className="flex flex-col justify-end">
            {typeof originalPrice === 'number' && originalPrice > currentPrice && (
              <h4 className="text-xs opacity-70 line-through first-text-color-for-paragraph">
                <PriceDisplay
                  amount={originalPrice}
                  currency={localizedPrice?.currencyCode ?? product.currencyCode}
                  currencyMode="none"
                  languageCode={lang}
                />
              </h4>
            )}
            <span className="text-base font-sm-bold first-text-color-for-paragraph">
              <PriceDisplay
                amount={currentPrice}
                currency={localizedPrice?.currencyCode ?? product.currencyCode}
                currencyMode="none"
                languageCode={lang}
              />
            </span>
          </div>
          {product.freeShipping && (
            <span className="rounded-full border border-emerald-300/70 bg-emerald-100/60 px-2 py-0.5 text-[10px] font-s-medium text-emerald-700">
              {labels.freeShipping}
            </span>
          )}
        </div>
        {showOfferTimer && localizedPrice?.saleEndDateUtc && (
          <OfferCountdown lang={lang} saleEndDateUtc={localizedPrice.saleEndDateUtc} />
        )}
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
    </article>
  );
}
