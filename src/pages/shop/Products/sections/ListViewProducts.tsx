import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import cleanText from "@/utils/cleanText";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import {
  type ProductViewProps,
  getProductOriginalPrice,
  getProductPrice,
  getProductTranslation,
} from "@/components/reusable-components/AllCategories/productView.types";

interface ListProductItemProps extends Omit<ProductViewProps, "products"> {
  product: ProductViewProps["products"][number];
}

function ListProductItem({ product, lang, getImageUrl }: ListProductItemProps) {
  const localizedPath = useLocalizedPath();
  const [isHovered, setIsHovered] = useState(false);
  const isRTL = lang === "fa";
  const translation = getProductTranslation(product, lang);
  const currentPrice = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);
  const rating = typeof product.rating === "number" ? product.rating : 4.5;
  const imageUrl = getImageUrl(product);

  const price = isRTL ? formatPrice(currentPrice) : formatPriceEn(currentPrice);

  return (
    <Link
      to={localizedPath(`/products/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex gap-6 p-4 rounded-2xl transition-colors duration-300 ${
        isHovered ? "bg-first text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="w-40 h-40">
        <img
          src={imageUrl ?? ""}
          className="w-full h-full object-contain"
          alt={translation?.name ?? product.name}
        />
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-base mb-1">
            {translation?.name ?? product.name}
          </h3>
          <p className="text-sm line-clamp-2">
            {cleanText(translation?.description)}
          </p>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
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
      </div>
    </Link>
  );
}

export function ListViewProduct({ products, lang, getImageUrl }: ProductViewProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ListProductItem
          key={product.id}
          product={product}
          lang={lang}
          getImageUrl={getImageUrl}
        />
      ))}
    </div>
  );
}
