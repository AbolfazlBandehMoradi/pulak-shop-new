import apiClient from "@/services/apiClient";
import { useLangStore } from "@/stores/languageStore";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useCategories = () => {
  const lang = useLangStore((s) => s.lang);
  return useQuery<Category[]>({
    queryKey: ["categories", lang],
    queryFn: () => {
      return apiClient
        .get(`/ui/general/index/category-tree`, {
          params: { langCode: lang },
        })
        .then((res) => res.data);
    },
  });
};

export default useCategories;
