// وقتی تاریخ درست شد از این کامپونتت استفاده کن 
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import cleanText from "@/utils/cleanText";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onLinkHover: (isHovering: boolean | null, id: number) => void;
}

export const DiscountProductCardStatic: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const [imageError, setImageError] = useState(false);
  const localizedPath = useLocalizedPath();
  const productUrl = localizedPath(`/products/${product.slug}`);

  // Fallback image logic using placehold.co
  const imageUrl = imageError
    ? `https://placehold.co/600x400/f1f5f9/475569?text=${encodeURIComponent(
      product.nameEn || "Product"
    )}`
    : product.image;

  const displayName = isRTL ? product.name : product.nameEn || product.name;
  const price = isRTL
    ? formatPrice(product.price)
    : formatPriceEn(product.price);

  return (
    <div  >
      <Link
        className=""
        to={product.inStock ? productUrl : "#"}
      >
        <div className="flex items-center gap-2">
          <div className="w-fit items-center rounded-md bg-secound-950 font-xs font-f-light text-white py-1 px-2" >
            پیشنهاد ویژه
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white">
              {product.rating?.toFixed(1) || "4.5"}
            </span>
          </div>
        </div>
        <div >
          <h3 className="text-white text-2xl font-s-bold">
            {displayName}
          </h3>
          <p className="text-white mt-4">
            {cleanText(product?.description)}
          </p>
          <div className="flex justify-between" >
            <div className="flex items-center gap-1">
              <span className="text-white text-lg">
                {price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-400 line-through decoration-zinc-400/50">
                  {isRTL
                    ? formatPrice(product.originalPrice)
                    : formatPriceEn(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="first-style-button-bg items-center gap-2 rounded-xl  flex justify-between text-center p-4  text-white transition-all duration-300">
              <span>
                مشاهده بیشتر
              </span>
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-white mt-8 text-3xl font-s-bold">
            ژوفر راه حل فوری بوی بد دهان هر مکان هر زمان
          </p>
        </div>
      </Link >
    </div >
  );
};
