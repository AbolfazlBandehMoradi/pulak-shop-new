import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductsInfinite } from "@/utils/shopApi";
import { useLangStore } from "@/stores/languageStore";
import { useShopStore } from "@/stores/productsFilterStore";
import { useMemo } from "react";

export function useInfiniteProducts() {
  const langCode = useLangStore((s) => s.lang || "fa");
  const search = useShopStore((s) => s.search);
  const categoryIds = useShopStore((s) => s.categoryIds);
  const hasOffer = useShopStore((s) => s.hasOffer);
  const sortBy = useShopStore((s) => s.sortBy);
  const sortDescending = useShopStore((s) => s.sortDescending);
  const normalizedCategoryIds = useMemo(() => [...categoryIds].sort(), [categoryIds]);
  const categoryIdsKey = normalizedCategoryIds.join(",");

  return useInfiniteQuery({
    queryKey: [
      "products",
      langCode,
      search ?? "",
      categoryIdsKey,
      hasOffer ? "1" : "0",
      sortBy ?? "",
      sortDescending ? "1" : "0",
    ],
    queryFn: ({ pageParam = 1 }) =>
      getProductsInfinite({
        pageParam,
        pageSize:9,
        langCode,
        search,
        categoryIds: normalizedCategoryIds,
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
