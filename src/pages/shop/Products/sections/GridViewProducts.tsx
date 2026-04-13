import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import cleanText from "@/utils/cleanText";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import {
  type ProductViewProps,
  getProductDiscount,
  getProductOriginalPrice,
  getProductPrice,
  getProductTranslation,
  isProductInStock,
} from "@/components/reusable-components/AllCategories/productView.types";

interface GridProductItemProps extends Omit<ProductViewProps, "products"> {
  product: ProductViewProps["products"][number];
}

function GridProductItem({ product, lang, getImageUrl }: GridProductItemProps) {
  const localizedPath = useLocalizedPath();
  const [isHovered, setIsHovered] = useState(false);
  const isRTL = lang === "fa";
  const translation = getProductTranslation(product, lang);
  const currentPrice = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const discount = getProductDiscount(product);
  const inStock = isProductInStock(product);
  const rating = typeof product.rating === "number" ? product.rating : 4.5;
  const imageUrl = getImageUrl(product);

  const price = isRTL ? formatPrice(currentPrice) : formatPriceEn(currentPrice);

  return (
    <Link
      to={localizedPath(`/products/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-4 rounded-2xl flex flex-col justify-between transition-colors duration-300 ${
        isHovered ? "bg-first text-white" : "bg-gray-100 text-black"
      }`}
    >
      {!inStock && (
        <div className="absolute top-4 start-4 z-10">
          <Badge
            className={`text-xs py-1 px-2 ${
              isHovered ? "bg-red-400" : "bg-red-500"
            } text-white`}
          >
            ناموجود
          </Badge>
        </div>
      )}

      <div className="h-56 flex items-center justify-center">
        <img
          src={imageUrl ?? ""}
          className="h-full w-full object-contain"
          alt={translation?.name ?? product.name}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        {typeof discount === "number" && discount > 0 && (
          <Badge
            className={`text-xs py-1 px-2 ${
              isHovered ? "bg-yellow-400 text-black" : "bg-third/10 text-third"
            }`}
          >
            {discount}% OFF
          </Badge>
        )}

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
      </div>

      <hr className="my-3 border-gray-300" />

      <div className="flex-1">
        <h3 className="font-semibold text-base mb-1 line-clamp-1">
          {translation?.name ?? product.name}
        </h3>
        <p className="text-sm line-clamp-2">
          {cleanText(translation?.description)}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          <span className="text-lg font-bold">{price}</span>
          {typeof originalPrice === "number" && originalPrice > currentPrice && (
            <span className="block text-xs line-through">
              {isRTL ? formatPrice(originalPrice) : formatPriceEn(originalPrice)}
            </span>
          )}
        </div>

        <div className="w-10 h-10 rounded-md bg-first hover:bg-first-700 text-white flex items-center justify-center">
          <ShoppingCart className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

export function GridViewProduct({ products, lang, getImageUrl }: ProductViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <GridProductItem
          key={product.id}
          product={product}
          lang={lang}
          getImageUrl={getImageUrl}
        />
      ))}
    </div>
  );
}
