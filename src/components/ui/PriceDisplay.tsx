import TomanIcon from '@/components/ui/Toman';
import { useLangStore } from '@/stores/languageStore';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/numberFormat';

type Currency = 'IRR' | 'IRT' | 'USD';
type CurrencyMode = 'label' | 'symbol' | 'none';
type StyleVariant = 'primary' | 'secondary';

interface PriceDisplayProps {
  amount: number | null | undefined;
  currency?: Currency | string;
  currencyMode?: CurrencyMode;
  variant?: StyleVariant;
  languageCode?: string;
  className?: string;
  valueClassName?: string;
  currencyClassName?: string;
}

function resolveCurrency(value?: string): Currency {
  if (!value) return 'IRT';
  const normalized = value.trim().toUpperCase();

  if (normalized === 'USD' || normalized === '$' || normalized === 'US$') return 'USD';
  if (
    normalized === 'IRR' ||
    normalized === 'RIAL' ||
    normalized === 'ریال' ||
    normalized === '﷼'
  ) {
    return 'IRR';
  }
  if (normalized === 'IRT' || normalized === 'TOMAN' || normalized === 'تومان') return 'IRT';

  return 'IRT';
}

export function PriceDisplay({
  amount,
  currency = 'IRT',
  currencyMode = 'label',
  variant = 'primary',
  languageCode,
  className,
  valueClassName,
  currencyClassName,
}: PriceDisplayProps) {
  const storeLanguage = useLangStore((state) => state.lang);
  const effectiveLanguage = languageCode || storeLanguage || 'en';
  const isPersian = effectiveLanguage === 'fa';

  if (amount === null || amount === undefined) return null;

  const resolvedCurrency = resolveCurrency(currency);
  const formatted = formatPrice(amount, resolvedCurrency, effectiveLanguage);

  let variantWrapperClass = '';
  let variantValueClass = '';
  let variantCurrencyClass = '';

  if (resolvedCurrency === 'IRT') {
    if (variant === 'secondary') {
      variantValueClass = 'font-medium';
      variantCurrencyClass = 'text-gray-500 font-light';
    }
  } else if (resolvedCurrency === 'IRR') {
    if (variant === 'primary') {
      variantWrapperClass = 'bg-gray-100 text-gray-700 px-2 py-1 rounded-md shadow-sm';
      variantValueClass = 'font-semibold tracking-wide';
      variantCurrencyClass = 'text-xs text-gray-500 opacity-80';
    } else {
      variantWrapperClass = 'text-slate-600';
      variantValueClass = 'font-normal';
      variantCurrencyClass = 'text-slate-400 text-xs italic';
    }
  } else if (resolvedCurrency === 'USD') {
    if (variant === 'primary') {
      variantWrapperClass =
        'bg-green-100 border-l-4 border-green-500 text-green-900 px-3 py-2 rounded-r-md';
      variantValueClass = 'font-black text-xl';
      variantCurrencyClass = 'text-green-700 font-bold';
    } else {
      variantWrapperClass = 'bg-zinc-900 text-green-400 px-3 py-1 rounded-full';
      variantValueClass = 'font-mono text-sm';
      variantCurrencyClass = 'text-green-500/70 text-xs';
    }
  }

  const renderCurrency = () => {
    if (currencyMode === 'none') return null;

    const finalCurrencyClass = cn(variantCurrencyClass, currencyClassName);

    if (resolvedCurrency === 'USD') {
      return <span className={finalCurrencyClass}>{currencyMode === 'symbol' ? '$' : 'USD'}</span>;
    }

    if (isPersian) {
      if (currencyMode === 'symbol') {
        return <TomanIcon className={cn('', finalCurrencyClass)} />;
      }
      return <span className={finalCurrencyClass}>{resolvedCurrency === 'IRR' ? 'ریال' : 'تومان'}</span>;
    }

    return (
      <span className={finalCurrencyClass}>
        {currencyMode === 'symbol' && resolvedCurrency === 'IRR' ? '﷼' : resolvedCurrency}
      </span>
    );
  };

  return (
    <span className={cn('inline-flex items-center gap-1', variantWrapperClass, className)}>
      {isPersian ? (
        <>
          <span className={cn(variantValueClass, valueClassName)}>{formatted}</span>
          {renderCurrency()}
        </>
      ) : (
        <>
          {renderCurrency()}
          <span className={cn(variantValueClass, valueClassName)}>{formatted}</span>
        </>
      )}
    </span>
  );
}

