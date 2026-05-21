import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from '@/components/ui/Badge';
import cleanText from '@/utils/cleanText';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import {
  type CatalogProduct,
  getProductDiscount,
  getProductOriginalPrice,
  getProductPrice,
  getProductTranslation,
  isProductInStock,
} from '@/types/productView.types';
import { type Language } from '@/types';

type ProductCardProps = {
  product: CatalogProduct;
  lang: Language;
  getImageUrl: (product: CatalogProduct) => string | null;
};

export default function ProductCard({ product, lang, getImageUrl }: ProductCardProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();

  const isRTL = lang === 'fa';
  const translation = getProductTranslation(product, lang);
  const currentPrice = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscount(product);
  const inStock = isProductInStock(product);
  const rating = typeof product.rating === 'number' ? product.rating : 4.5;
  const imageUrl = getImageUrl(product);

  return (
    <article
      className="relative flex h-95 flex-col justify-between rounded-xl border border-first-100/70 bg-color-for-layer-on-body p-4 shadow-[0_10px_26px_-20px_rgba(27,126,251,0.45)] transition-all duration-300 hover:border-first-300 hover:shadow-first-md"
    >
      <div className="relative flex h-1/2 w-full items-center justify-center">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between">
          {typeof discount === 'number' && discount > 0 ? (
            <div className="rounded-md bg-third/20 px-2 py-1">
              <p className="text-[13px] text-first font-s-medium">{discount}%</p>
            </div>
          ) : (
            <div />
          )}

          {!inStock && (
            <Badge className="bg-red-500 px-2 py-1 text-xs text-white">{t('productsFilter.outOfStock')}</Badge>
          )}
        </div>

        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-color-for-layer-sec">
          <img
            src={imageUrl ?? ''}
            className="h-full w-full object-contain"
            alt={translation?.name ?? product.name}
            loading="lazy"
          />
        </div>
      </div>

      <div>
        <h3 className="line-clamp-1 pb-1 pt-2 text-base font-s-medium first-text-color">
          {translation?.name ?? product.name}
        </h3>
        <p className="line-clamp-2 text-sm font-f-light first-text-color-for-paragraph">
          {cleanText(translation?.description)}
        </p>
      </div>

      <div className="my-2 flex items-center justify-between">
        <div className="flex flex-col">
          {typeof originalPrice === 'number' && originalPrice > currentPrice && (
            <h4 className="text-sm line-through opacity-70 first-text-color-for-paragraph">
              <PriceDisplay
                amount={originalPrice}
                currency={isRTL ? 'IRT' : 'USD'}
                currencyMode="none"
                languageCode={lang}
              />
            </h4>
          )}

          <span className="text-base font-sm-bold first-text-color-for-paragraph">
            <PriceDisplay
              amount={currentPrice}
              currency={isRTL ? 'IRT' : 'USD'}
              currencyMode="none"
              languageCode={lang}
            />
          </span>
        </div>

        <div className="flex items-center gap-1 border-s border-first-100 ps-2">
          <span className="text-xs first-text-color-for-paragraph">{rating.toFixed(1)}</span>
          <span className="text-xs first-text-color-for-paragraph">/ 5</span>
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        </div>
      </div>

      <div className="w-full">
        <Link
          to={localizedPath(`/products/${product.slug}`)}
          className="block w-full rounded-lg bg-first px-4 py-2 text-center text-white transition-colors hover:bg-first-700"
        >
          {t('shop.viewProduct')}
        </Link>
      </div>
    </article>
  );
}
