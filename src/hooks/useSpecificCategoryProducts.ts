import apiClient from "@/services/apiClient";
import { useLangStore } from "@/stores/languageStore";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useSpecificCategoryProducts = (count = 10, categoryName: string) => {
  const lang = useLangStore((s) => s.lang);
  return useQuery<Product[]>({
    queryKey: ["indexCategories", lang, count, categoryName],
    queryFn: () => {
      return apiClient
        .get("/ui/general/index/products-by-category", {
          params: {
            langCode: lang,
            categoryName: categoryName,
            count: count,
          },
        })
        .then((res) => res.data).catch(error => {
          console.error("Error fetching specific category products:", error);
          throw error;
        });
    },
    enabled: !!categoryName,
    staleTime: 5 * 60 * 1000
  });
};

export default useSpecificCategoryProducts;
