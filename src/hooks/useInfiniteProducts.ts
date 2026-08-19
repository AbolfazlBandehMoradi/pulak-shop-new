import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductsInfinite } from "@/utils/shopApi";
import { useLangStore } from "@/stores/languageStore";
import { useShopStore } from "@/stores/productsFilterStore";
import { useMemo } from "react";

export function useInfiniteProducts() {
  const langCode = useLangStore((s) => s.lang || "fa");
  const search = useShopStore((s) => s.search);
  const categoryIds = useShopStore((s) => s.categoryIds);
  const showcaseIds = useShopStore((s) => s.showcaseIds);
  const minPrice = useShopStore((s) => s.minPrice);
  const maxPrice = useShopStore((s) => s.maxPrice);
  const hasOffer = useShopStore((s) => s.hasOffer);
  const sortBy = useShopStore((s) => s.sortBy);
  const sortDescending = useShopStore((s) => s.sortDescending);
  const normalizedCategoryIds = useMemo(() => [...categoryIds].sort(), [categoryIds]);
  const normalizedShowcaseIds = useMemo(() => [...showcaseIds].sort(), [showcaseIds]);
  const categoryIdsKey = normalizedCategoryIds.join(",");
  const showcaseIdsKey = normalizedShowcaseIds.join(",");

  return useInfiniteQuery({
    queryKey: [
      "products",
      langCode,
      search ?? "",
      categoryIdsKey,
      showcaseIdsKey,
      minPrice ?? "",
      maxPrice ?? "",
      hasOffer ? "1" : "0",
      sortBy ?? "",
      sortDescending ? "1" : "0",
    ],
    queryFn: ({ pageParam = 1 }) =>
      getProductsInfinite({
        pageParam,
        pageSize:12,
        langCode: "fa",
        search,
        categoryIds: normalizedCategoryIds,
        showcaseIds: normalizedShowcaseIds,
        minPrice,
        maxPrice,
        hasOffer,
        sortBy,
        sortDescending,
        status: "Active",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.pageNumber + 1 : undefined,
    staleTime: 30000,
  });
}
