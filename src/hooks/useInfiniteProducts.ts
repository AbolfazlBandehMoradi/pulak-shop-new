import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductsInfinite } from "@/utils/shopApi";
import { useLangStore } from "@/stores/languageStore";
import { useShopStore } from "@/stores/productsFilterStore";

export function useInfiniteProducts() {
  const langCode = useLangStore((s) => s.lang || "fa");
  const { search, categoryIds, hasOffer, sortBy, sortDescending } = useShopStore();

  return useInfiniteQuery({
    queryKey: [
      "products",
      {
        langCode,
        search,
        categoryIds: [...categoryIds].sort(),
        hasOffer,
        sortBy,
        sortDescending,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      getProductsInfinite({
        pageParam,
        pageSize:9,
        langCode,
        search,
        categoryIds,
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
