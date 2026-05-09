import apiClient from "@/services/apiClient"
import { useLangStore } from "@/stores/languageStore"
import { Blog, Category, Product, Testimonial } from "@/types";
import { useQuery } from "@tanstack/react-query"

export interface IndexData {
  categories: Category[];
  newestProducts: Product[];
  discountProducts: Product[];
  blogs: Blog[];
  testimonials: Testimonial[];
}

const useIndex = () => {
  const lang = useLangStore(s => s.lang)
  return useQuery<IndexData>({
    queryKey: ["index", lang],
    queryFn: () => {
      return apiClient.get('/ui/general/index', {
        params: {
          langCode: lang
        }
      }).then(res => res.data)
    },
    staleTime: 60
  })
}

export default useIndex;