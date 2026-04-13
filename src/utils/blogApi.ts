import { apiRequest } from './api'

export interface BlogTranslation {
  id: number
  languageCode: string
  title: string
  excerpt?: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogTitle?: string
  ogDescription?: string
}

export interface MediaFile {
  id: number
  fileName: string
  filePath: string
  thumbnailPath?: string
  alt?: string
  title?: string
}

export interface RelatedProduct {
  productId: number
  productName: string
  productSlug: string
  productImageUrl?: string
  price?: number
  currencyCode?: string
  displayOrder: number
}

export interface BlogDetail {
  id: number
  slug: string
  isPublished: boolean
  isFeatured: boolean
  status: string
  mainImageId?: number
  mainImage?: MediaFile
  displayOrder: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  translation?: BlogTranslation
  relatedProducts: RelatedProduct[]
}

export interface BlogListItem {
  id: number
  slug: string
  title: string
  excerpt?: string
  isPublished: boolean
  isFeatured: boolean
  status: string
  mainImage?: MediaFile
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface BlogListResponse {
  blogs: BlogListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export async function getBlogBySlug(slug: string, langCode?: string): Promise<BlogDetail> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const response = await apiRequest(
    `/api/ui/blog/${slug}?${queryParams.toString()}`
  ) as BlogDetail

  return response
}

export async function getBlogs(params: {
  langCode?: string
  pageNumber?: number
  pageSize?: number
  search?: string
  status?: string
  isFeatured?: boolean
  sortBy?: string
  sortDescending?: boolean
}): Promise<BlogListResponse> {
  const queryParams = new URLSearchParams()
  if (params.langCode) queryParams.append('langCode', params.langCode)
  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString())
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.status) queryParams.append('status', params.status)
  if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString())
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.sortDescending !== undefined) queryParams.append('sortDescending', params.sortDescending.toString())

  const response = await apiRequest(
    `/api/ui/blog?${queryParams.toString()}`
  ) as BlogListResponse

  return response
}

