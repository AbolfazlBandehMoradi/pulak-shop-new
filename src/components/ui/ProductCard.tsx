import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onLinkHover: (isHovering: boolean | null, id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
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
    <div className="h-95  p-4 rounded-2xl  bg-color-for-layer-sec relative flex flex-col justify-between">
      <Link
        to={product.inStock ? productUrl : "#"}
        className={`flex flex-col h-full ${
          !product.inStock ? "pointer-events-none opacity-70" : ""
        }`}
      >
        {/* --- Image Section --- */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50 dark:bg-zinc-800">
          <motion.img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover origin-center transition-transform duration-700 will-change-transform group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          {/* Dark Overlay gradient on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Badges (Top Left/Right) */}
          <div className="absolute top-4 start-4 flex flex-col gap-2 z-10">
            {product.discount && (
              <Badge
                variant="danger"
                className="shadow-sm backdrop-blur-md bg-red-500/90 text-white border-0 px-2.5 py-1"
              >
                {product.discount}% {isRTL ? "تخفیف" : "OFF"}
              </Badge>
            )}
            {!product.inStock && (
              <Badge
                variant="default"
                className="shadow-sm backdrop-blur-md bg-black/60 text-white border-0"
              >
                {t("products.outOfStock")}
              </Badge>
            )}
          </div>
          <div className="absolute top-4 end-4 flex flex-col gap-2 translate-x-12 rtl:-translate-x-12 group-hover:translate-x-0 rtl:group-hover:translate-x-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onQuickView?.(product);
              }}
              className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
              title={t("products.quickView") || "Quick View"}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-pink-600 hover:text-white transition-all hover:scale-110"
              title={t("products.wishlist") || "Add to Wishlist"}
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="p-5 flex flex-col flex-grow relative">
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {product.rating?.toFixed(1) || "4.5"}
            </span>
            <span className="text-xs text-zinc-400">
              ({product.reviewsCount || 85})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>

          {/* Subtitle / Category */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-1">
            {isRTL ? "محصولات دیجیتال" : "Digital Products"}
          </p>

          {/* Footer Area: Price <-> Add to Cart Swap */}
          <div className="mt-auto relative h-12 overflow-hidden">
            {/* 1. Price State (Visible by default, slides OUT UP on hover) */}
            <div className="absolute inset-0 flex items-center justify-between transition-transform duration-500 group-hover:-translate-y-[150%]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-zinc-900 dark:text-white">
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
              {product.inStock && (
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* 2. Button State (Hidden below, slides IN UP on hover) */}
            <div className="absolute inset-0 flex items-center transition-transform duration-500 translate-y-[150%] group-hover:translate-y-0">
              <Button
                variant="primary"
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 border-none"
                disabled={!product.inStock}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t("products.addToCart")}</span>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
