import React, { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import cleanText from "@/utils/cleanText";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onLinkHover: (isHovering: boolean | null, id: number) => void;
}

export const SpecificCategoryProductsCard: React.FC<ProductCardProps> = ({
  product,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = imageError
    ? `https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(
      product.nameEn || "Product"
    )}`
    : product.image;

  const price = isRTL
    ? formatPrice(product.price)
    : formatPriceEn(product.price);

  return (
    <div
      className={`h-100 cursor-pointer p-4 rounded-2xl flex flex-col justify-between transition-colors duration-300 ${isHovered ? "bg-[#1b9a9d] text-white" : "bg-gray-100 text-black"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-4 start-4 flex flex-col z-10">
        {!product.inStock && (
          <Badge
            variant="default"
            className={`text-xs font-f-light py-1 px-2 ${isHovered ? "bg-red-400 text-white" : "bg-red-500 text-white"
              }`}
          >
            {t("products.outOfStock")}
          </Badge>
        )}
      </div>

      {/* تصویر محصول */}
      <div className="h-2/4 w-full flex flex-wrap justify-center items-center">
        <div className="w-full h-80/96">
          <img
            src={imageUrl}
            onError={() => setImageError(true)}
            alt={product?.name || "Product"}
            className="h-full w-full object-contain "
          />
        </div>

        {/* تخفیف و امتیاز */}
        <div className="w-full flex items-center justify-between h-16/96">
          {product.discount && (
            <Badge
              variant="danger"
              className={`text-xs font-f-light py-1 px-2 ${isHovered ? "bg-yellow-400 text-black" : "bg-third/10 text-third"
                }`}
            >
              {product.discount}% {isRTL ? "تخفیف" : "OFF"}
            </Badge>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{product.rating?.toFixed(1) || "4.5"}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>

      <hr className="my-2 border-gray-300" />

      {/* نام و توضیحات */}
      <div className="h-2/4 flex flex-col justify-between">
        <div>
          <h2 className="font-s-medium text-base pb-1">{product?.name}</h2>
          <p className="font-f-light text-sm line-clamp-2">
            {cleanText(product?.description)}
          </p>
        </div>

        {/* قیمت و دکمه سبد */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg font-bold">{price}</span>
            {product.originalPrice && (
              <span className="text-xs line-through">
                {isRTL
                  ? formatPrice(product.originalPrice)
                  : formatPriceEn(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="w-12/96">
            <div className="w-10 h-10 p-2 rounded-md bg-first hover:bg-first-700 text-white flex items-center justify-center border-none">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
