import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatPriceEn } from "@/utils/formatPrice";
import cleanText from "@/utils/cleanText";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { cn } from "@/utils/cn";
import {
  type ProductViewProps,
  getProductDiscount,
  getProductOriginalPrice,
  getProductPrice,
  getProductTranslation,
  isProductInStock,
} from "@/types/productView.types";

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
  const outOfStockLabel = isRTL ? "\u0646\u0627\u0645\u0648\u062C\u0648\u062F" : "Out of stock";
  const viewProductLabel = isRTL ? "\u0645\u0634\u0627\u0647\u062F\u0647 \u0645\u062D\u0635\u0648\u0644" : "View Product";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex h-95 flex-col justify-between rounded-xl border p-4 transition-all duration-300",
        isHovered
          ? "border-first-300 shadow-first-md"
          : "border-first-100/70 shadow-[0_10px_26px_-20px_rgba(27,126,251,0.45)]",
        "bg-color-for-layer-on-body"
      )}
    >
      <div className="relative flex h-1/2 w-full items-center justify-center">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between">
          {typeof discount === "number" && discount > 0 ? (
            <div className="rounded-md bg-third/20 px-2 py-1">
              <p className="text-[13px] text-first font-s-medium">{discount}%</p>
            </div>
          ) : (
            <div />
          )}

          {!inStock && (
            <Badge className="bg-red-500 px-2 py-1 text-xs text-white">{outOfStockLabel}</Badge>
          )}
        </div>

        <div className="h-full w-full overflow-hidden rounded-xl bg-color-for-layer-sec flex items-center justify-center">
          <img
            src={imageUrl ?? ""}
            className="h-full w-full object-contain"
            alt={translation?.name ?? product.name}
          />
        </div>
      </div>

      <div>
        <h3 className="pb-1 pt-2 text-base font-s-medium first-text-color line-clamp-1">
          {translation?.name ?? product.name}
        </h3>
        <p className="line-clamp-2 text-sm font-f-light first-text-color-for-paragraph">
          {cleanText(translation?.description)}
        </p>
      </div>

      <div className="my-2 flex items-center justify-between">
        <div className="flex flex-col">
          {typeof originalPrice === "number" && originalPrice > currentPrice && (
            <h4 className="text-sm line-through opacity-70 first-text-color-for-paragraph">
              {isRTL ? formatPrice(originalPrice) : formatPriceEn(originalPrice)}
            </h4>
          )}
          <span className="text-base font-sm-bold first-text-color-for-paragraph">{price}</span>
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
          {viewProductLabel}
        </Link>
      </div>
    </div>
  );
}

export function GridViewProduct({ products, lang, getImageUrl }: ProductViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <GridProductItem key={product.id} product={product} lang={lang} getImageUrl={getImageUrl} />
      ))}
    </div>
  );
}
