import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ShowCaseItem } from "@/hooks/useShowcases";
import cleanText from "@/utils/cleanText";
import { useLangStore } from "@/stores/languageStore";

interface ProductCardProps {
  showCaseItem: ShowCaseItem;
  onQuickView?: (product: Product) => void;
  onLinkHover: (isHovering: boolean | null, id: number) => void;
}

export const ShowCaseCardComingSoon: React.FC<ProductCardProps> = ({
  showCaseItem,
  onQuickView,
}) => {
  const { t, i18n } = useTranslation();
  const product = showCaseItem.product;
  const isRTL = i18n.language === "fa";
  const [imageError, setImageError] = useState(false);
  const lang = useLangStore((s) => s.lang);
  const productUrl = `/products/${product.slug}`;

  // Fallback image logic using placehold.co
  const imageUrl = imageError
    ? `https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(
      product.nameEn || "Product"
    )}`
    : product.image;

  const displayName = isRTL ? product.name : product.nameEn || product.name;
  const price = <PriceDisplay amount={product.price} languageCode={isRTL ? 'fa' : 'en'} />;

  return (
    <div className="h-100 cursor-pointer  p-4 rounded-2xl  bg-color-for-layer-on-body relative flex flex-col justify-between   ">
      <div className="absolute top-4 start-4 flex flex-col  z-10">
        {!product.inStock && (
          <Badge
            variant="default"
            className="text-xs bg-red-500 text-white font-f-light py-1 px-2"
          >
            {t("product.outOfStock")}
          </Badge>
        )}
      </div>
      <div className="h-2/4  w-full flex flex-wrap justify-center items-center">
        <div className="w-full h-80/96">
          {!imageError && imageUrl ? (
            <div className="h-full w-full  overflow-hidden flex justify-center items-center rounded-xl">
              <img
                src={imageUrl}
                className="h-full w-fulL object-contain "
                onError={() => setImageError(true)}
                alt={product?.name || "Product"}
              />
            </div>
          ) : (
            <div className="h-full w-full bg-color-for-layer-sec relative rounded-xl">
              <div className="absolute inset-0 before:content-[''] before:absolute before:inset-0 before:backdrop-blur-sm before:rounded-xl before:z-10" />
              <img
                src={imageUrl}
                className="h-full w-full object-cover rounded-xl"
                onError={() => setImageError(true)}
                alt={product?.name || "Product"}
              />
              <span className="z-20 bottom-1/2 right-1/2 text-sm text-red-500 translate-x-1/2 translate-y-1/2 absolute">
                عکس بارگذاری نشد
              </span>
            </div>
          )}
        </div>
        <div className="w-full flex items-center justify-between h-16/96">
          <div>
            {product.discount && (
              <Badge
                variant="danger"
                className="text-xs bg-third/10  font-f-light text-third py-1 px-2"
              >
                {product.discount}% {isRTL ? "تخفیف" : "OFF"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 ">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {product.rating?.toFixed(1) || "4.5"}
            </span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>
      <hr className="first-text-color-hr-on-secound-layer my-2" />
      <div className="h-2/4  flex flex-col justify-between">
        <div>
          <h2
            className={`font-s-medium text-base first-text-color  pb-1 ${lang === "fa"
              ? "text-right"
              : "text-left"
              }`}>
            {product?.name}
          </h2>
          <p
            className={`font-f-light first-text-color-for-paragraph text-sm line-clamp-2 ${lang === "fa"
              ? "text-right"
              : "text-left"
              }`}>
            {cleanText(product?.description)}
          </p>
        </div>
        <div
          className={`flex justify-between items-center ${lang === "fa"
            ? "flex-row"
            : "flex-row-reverse"
            }`}>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through decoration-zinc-400/50">
                <PriceDisplay amount={product.originalPrice} languageCode={isRTL ? 'fa' : 'en'} />
              </span>
            )}
          </div>
          <div className="w-12/96">
            <div className="w-10 h-10 p-2 rounded-md bg-first hover:bg-first-700 text-white  flex items-center justify-center  border-none">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

