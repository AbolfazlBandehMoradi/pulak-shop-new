import apiClient from "@/services/apiClient"
import { useLangStore } from "@/stores/languageStore"
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query"

export interface Showcase {
  id: number
  slug: string
  isPublished: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  translation: Translation
  items: ShowCaseItem[]
}

export interface Translation {
  id: number
  languageCode: string
  title: string
  description: string
}

export interface ShowCaseItem {
  id: number
  sortOrder: number
  type: string
  product: Product
  slug: string; // <-- اضافه شد
}

const useShowcases = () => {
  const lang = useLangStore(s => s.lang)
  return useQuery<Showcase[]>({
    queryKey: ["showcase", lang],
    queryFn: () => {
      return apiClient.get('/ui/general/showcases', {
        params: {
          langCode: lang
        }
      }).then(res => res.data)
    }
  })
}

export default useShowcases;