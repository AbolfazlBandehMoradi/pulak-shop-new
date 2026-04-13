// hooks/useShopFilters.ts
import { useQuery } from "@tanstack/react-query";
import { getFilters } from "@/utils/shopApi";
import { useLangStore } from "@/stores/languageStore";

export function useProductsFilters() {
  const lang = useLangStore((s) => s.lang);

  return useQuery({
    queryKey: ["shop-filters", lang],
    queryFn: () => getFilters(lang || "fa"),
  });
}
