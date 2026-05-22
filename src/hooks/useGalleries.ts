import apiClient from "@/services/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  altText: string;
  displayOrder: number;
  category: GalleryCategory;
  image: string;
}

export interface GalleriesResponse {
  items: GalleryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

const useGalleries = () => {
  return useQuery<GalleriesResponse>({
    queryKey: ["galleries"],
    queryFn: () => {
      return apiClient.get("/ui/general/galleries").then((res) => res.data);
    },
    staleTime: 60 * 60 * 1000,
  });
};

export default useGalleries;
