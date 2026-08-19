import { motion } from 'framer-motion';
import { Clock3, Sparkles, Tag } from 'lucide-react';
import RemainingTime from '@/components/ui/RemainingTime';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useTranslation } from '@/i18n/useTranslation';
import { toPersianNumbers } from '@/utils/numberFormat';
import { cn } from '@/utils/cn';
import type { ProductSaleOffer } from '@/utils/productOffer';

interface ProductOfferBannerProps {
  offer: ProductSaleOffer;
  languageCode: string;
  className?: string;
}

export function ProductOfferBanner({ offer, languageCode, className }: ProductOfferBannerProps) {
  const { t } = useTranslation();
  const isPersian = languageCode === 'fa';

  if (!offer.isTimedOffer || !offer.saleEndDate || !offer.salePrice) {
    return null;
  }

  const discountPercent = offer.discountPercent
    ? isPersian
      ? toPersianNumbers(offer.discountPercent)
      : offer.discountPercent
    : null;

  return (
    <motion.section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-third/25 bg-third/10 p-4 shadow-[0_18px_50px_rgba(194,86,45,0.12)] sm:p-5',
        className,
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label={t('product.specialOffer') || 'Special Offer'}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-third" aria-hidden="true" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-third px-3 py-1 text-xs font-s-bold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              {t('product.specialOffer') || 'Special Offer'}
            </span>
            {discountPercent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secound px-3 py-1 text-xs font-s-bold text-white">
                <Tag className="h-3.5 w-3.5" />
                {discountPercent}% {t('product.discountBadge') || 'Discount'}
              </span>
            ) : null}
          </div>
          <h2 className="text-lg font-s-bold first-text-color sm:text-xl">
            {t('product.offerEndsIn') || 'Offer ends in'}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-7 first-text-color-for-paragraph">
            {t('product.limitedOfferHint') || 'This discount is active for a limited time.'}
          </p>
          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl bg-color-for-layer-on-body px-3 py-2 text-sm first-text-color">
            <Clock3 className="h-4 w-4 text-third" />
            <span>{t('product.offerPriceNow') || 'Current offer price'}</span>
            <span className="font-s-bold text-third">
              <PriceDisplay amount={offer.salePrice} languageCode={languageCode} />
            </span>
          </div>
        </div>
        <RemainingTime expireDate={offer.saleEndDate} />
      </div>
    </motion.section>
  );
}
