import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductDetail } from "@/utils/shopApi";

export function useProductDetails(slug: string | undefined, lang: string) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-detail", slug, lang],
    queryFn: () => getProductDetail(slug!, lang),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  const product = data?.product ?? null;

  useEffect(() => {
    if (!data) return;
    setSelectedVariant(data.selectedVariantId ?? null);
  }, [data]);

  const currentPrice = useMemo(() => {
    if (!data) return null;

    if (selectedVariant && data.pricing.byVariant[selectedVariant]) {
      return data.pricing.byVariant[selectedVariant];
    }

    return data.pricing.current ?? null;
  }, [data, selectedVariant]);

  const currentInventory = useMemo(() => {
    if (!data) return null;

    if (selectedVariant && data.inventory.byVariant[selectedVariant]) {
      return data.inventory.byVariant[selectedVariant];
    }

    return data.inventory.current ?? null;
  }, [data, selectedVariant]);

  const isInStock = useMemo(() => {
    if (!data) return false;

    if (currentInventory) {
      return (
        currentInventory.allowBackorders || currentInventory.availableQuantity > 0
      );
    }

    return data.inventory?.isInStock ?? false;
  }, [currentInventory, data]);

  return {
    product,
    loading: isLoading,
    error: error as Error | null,

    selectedVariant,
    setSelectedVariant,

    currentPrice,
    currentInventory,
    isInStock,

    reviews: data?.reviews.items ?? [],
    reviewCount: data?.reviews.reviewCount ?? 0,
    averageRating: data?.reviews.averageRating ?? 0,
    ratingDistribution: data?.reviews.ratingDistribution ?? [],
  };
}
