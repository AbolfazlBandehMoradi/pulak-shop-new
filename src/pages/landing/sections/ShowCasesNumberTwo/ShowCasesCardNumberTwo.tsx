import React, { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import cleanText from '@/utils/cleanText';
import { ShowCaseItem } from '@/hooks/useShowcases';
import { useLangStore } from '@/stores/languageStore';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface ProductCardProps {
  showCaseItem: ShowCaseItem;
  onQuickView?: (product: any) => void;
  onLinkHover: (isHovering: boolean | null, id: number) => void;
}

export const ShowCasesCardNumberTwo: React.FC<ProductCardProps> = ({ showCaseItem }) => {
  const { t, i18n } = useTranslation();
  const product = showCaseItem.product;
  const isRTL = i18n.language === 'fa';
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lang = useLangStore((s) => s.lang);
  const imageUrl = imageError
    ? `https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(
        product.nameEn || 'Product',
      )}`
    : product.image;

  return (
    <div
      className={`h-100 cursor-pointer p-4 rounded-2xl flex flex-col justify-between transition-all duration-300 border ${
        isHovered
          ? 'bg-first-100 border-first-400 shadow-[0_20px_40px_-28px_rgba(14,99,231,0.9)]'
          : 'bg-color-for-layer-on-body first-text-color border-first-100/80 shadow-[0_14px_30px_-26px_rgba(27,126,251,0.55)]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Out of Stock */}
      <div className="absolute top-4 start-4 flex flex-col z-10">
        {!product.inStock && (
          <Badge
            variant="default"
            className={`text-xs font-f-light py-1 px-2 ${
              isHovered ? 'bg-red-400 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {t('product.outOfStock')}
          </Badge>
        )}
      </div>

      {/* Image Section */}
      <div className="h-2/4 w-full flex flex-wrap justify-center items-center">
        <div className="w-full h-80/96">
          <img
            src={imageUrl}
            onError={() => setImageError(true)}
            alt={product?.name || 'Product'}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Discount & Rating */}
        <div className="w-full flex items-center justify-between h-16/96">
          {product.discount && (
            <Badge
              variant="danger"
              className={`text-xs font-f-light py-1 px-2 ${
                isHovered ? 'bg-yellow-400 text-black' : 'bg-third/10 text-third'
              }`}
            >
              {product.discount}% {isRTL ? 'تخفیف' : 'OFF'}
            </Badge>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{product.rating?.toFixed(1) || '4.5'}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>

      <hr className={`my-2 ${isHovered ? 'border-white/35' : 'border-first-100'}`} />

      {/* Name & Description */}
      <div className="h-2/4 flex flex-col justify-between">
        <div>
          <h2
            className={`font-s-medium text-base pb-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}
          >
            {product?.name}
          </h2>
          <p
            className={`font-f-light text-sm line-clamp-2 ${
              lang === 'fa' ? 'text-right' : 'text-left'
            }`}
          >
            {cleanText(product?.description)}
          </p>
        </div>

        {/* Price & Cart */}
        <div
          className={`flex justify-between items-center ${
            lang === 'fa' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-lg font-bold">
              <PriceDisplay amount={product.price} currency={isRTL ? 'IRT' : 'USD'} currencyMode="none" languageCode={i18n.language} />
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through">
                <PriceDisplay amount={product.originalPrice} currency={isRTL ? 'IRT' : 'USD'} currencyMode="none" languageCode={i18n.language} />
              </span>
            )}
          </div>
          <div className="w-12/96">
            <div
              className={`w-10 h-10 p-2 rounded-md text-white flex items-center justify-center border-none bg-first hover:bg-first-700`}
            >
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
