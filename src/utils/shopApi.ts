import { apiRequest } from "./api";

export interface MediaFile {
  id: number;
  fileName: string;
  filePath: string;
  thumbnailPath?: string | null;
  alt?: string | null;
  title?: string | null;
}

export interface ProductListTranslation {
  languageCode: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  countryOfOriginDisplay: string | null;
  moneyBackPolicy: string | null;
  warrantyTerms: string | null;
  shippingLeadTime: string | null;
  shippingMethodsDescription: string | null;
  shippingCostRemarks: string | null;
  exchangeTerms: string | null;
  authenticityNote: string | null;
}

export interface ProductListPrice {
  id: number;
  productId: number;
  variantId: number | null;
  languageCode: string;
  currencyCode: string;
  currencySymbol: string;
  price: number;
  salePrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  hasSalePrice: boolean;
  isSaleActive: boolean;
  saleStartDateUtc: string | null;
  saleEndDateUtc: string | null;
  saleStartDate: string | null;
  saleStartTime: string | null;
  saleEndDate: string | null;
  saleEndTime: string | null;
  saleStartDateShamsi: string | null;
  saleEndDateShamsi: string | null;
  cultureInfoName: string | null;
  dateTimeShortDatePattern: string | null;
  dateTimeShortTimePattern: string | null;
  costPrice: number | null;
  taxRate: number | null;
  isTaxIncluded: boolean;
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  isPublished: boolean;
  isFeatured: boolean;
  status: string;
  mainImage?: MediaFile | null;
  createdAt: string;
  updatedAt: string;
  specificationsJson?: string | null;
  price: number;
  salePrice: number | null;
  currencyCode: string;
  currencySymbol: string;
  discountPercent: number | null;
  isOnSale: boolean;
  stockQuantity: number;
  tracksInventory: boolean;
  isFavorite: boolean;
  hasWarranty: boolean;
  warrantyType: string | null;
  postalMethod: string | null;
  vendorName: string | null;
  authenticity: string;
  countryOfOriginCode: string | null;
  hasMoneyBackGuarantee: boolean;
  warrantyDurationValue: number | null;
  warrantyDurationUnit: string;
  freeShipping: boolean;
  fixedShippingPrice: number | null;
  allowsExchange: boolean;
  sellerKind: string;
  prices: ProductListPrice[];
  attributeValuesWithDefinitions: Array<Record<string, unknown>>;
  translations: ProductListTranslation | ProductTranslation[] | null;
}

export interface ProductsResponse {
  languageCode: string;
  products: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetProductsParams {
  langCode?: string;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  hasOffer?: boolean;
  status?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ProductsInfiniteResponse {
  products: Product[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * Get products for shop page
 * @param params - Query parameters for filtering and pagination
 * @returns Products response with pagination info
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<ProductsResponse> {
  const queryParams = new URLSearchParams();

  if (params.langCode) queryParams.append("langCode", params.langCode);
  if (params.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.categoryIds?.length) {
    params.categoryIds.forEach((id) =>
      queryParams.append("categoryIds", id.toString())
    );
  }
  if (params.minPrice !== undefined)
    queryParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined)
    queryParams.append("maxPrice", params.maxPrice.toString());
  if (params.hasOffer !== undefined)
    queryParams.append("hasOffer", params.hasOffer.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.isFeatured !== undefined)
    queryParams.append("isFeatured", params.isFeatured.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortDescending !== undefined)
    queryParams.append("sortDescending", params.sortDescending.toString());

  const response = (await apiRequest(
    `/api/ui/shop/products?${queryParams.toString()}`
  )) as ProductsResponse;

  return response;
}

export async function getProductsInfinite(
  params: GetProductsParams & { pageParam?: number }
): Promise<ProductsInfiniteResponse> {
  const pageNumber = params.pageParam ?? params.pageNumber ?? 1;

  const response = await getProducts({
    ...params,
    pageNumber,
  });

  const hasMore = response.pageNumber * response.pageSize < response.totalCount;

  return {
    ...response,
    hasMore,
  };
}

export interface CategoryFilter {
  id: number;
  slug: string;
  parentCategoryId?: number;
  name: string;
  productCount: number;
}

export interface AttributeOptionFilter {
  id: number;
  value: string;
  label: string;
  colorCode?: string;
}

export interface AttributeFilter {
  id: number;
  code: string;
  name: string;
  attributeType: string;
  options: AttributeOptionFilter[];
}

export interface FiltersResponse {
  categories: CategoryFilter[];
  attributes: AttributeFilter[];
}

/**
 * Get all available filters (categories and attributes) for shop page
 * @param langCode - Language code for translations
 * @returns Filters response with categories and attributes
 */
export async function getFilters(langCode?: string): Promise<FiltersResponse> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append("langCode", langCode);

  const response = (await apiRequest(
    `/api/ui/shop/products/filters?${queryParams.toString()}`
  )) as FiltersResponse;

  return response;
}

// Product Detail Types
export interface ProductTranslation {
  id?: number;
  languageCode: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  countryOfOriginDisplay?: string | null;
  moneyBackPolicy?: string | null;
  warrantyTerms?: string | null;
  shippingLeadTime?: string | null;
  shippingMethodsDescription?: string | null;
  shippingCostRemarks?: string | null;
  exchangeTerms?: string | null;
  authenticityNote?: string | null;
}

export interface ProductCategory {
  id: number;
  slug: string;
  parentCategoryId?: number;
  imageId?: number;
  image?: MediaFile;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  isPrimaryCategory: boolean;
  assignmentDisplayOrder: number;
  name: string;
  translations: Array<{
    id: number;
    languageCode: string;
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
}

export interface Brand {
  id: number;
  slug: string;
  name?: string;
  logoId?: number;
  logo?: MediaFile;
  translations: Array<{
    id: number;
    languageCode: string;
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
}

export interface ProductImage {
  id: number;
  productId: number;
  mediaFileId: number;
  mediaFile: MediaFile;
  displayOrder: number;
  isMainImage: boolean;
}

export interface ProductPrice {
  id: number;
  productId?: number;
  variantId?: number;
  languageCode: string;
  currencyCode: string;
  currencySymbol: string;
  price: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  costPrice?: number;
  taxRate?: number;
  isTaxIncluded: boolean;
  isOnSale: boolean;
  displayPrice: number;
}

export interface ProductInventory {
  id: number;
  productId?: number;
  variantId?: number;
  warehouseCode?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  stockStatus: string;
  lastUpdated: string;
  isLowStock: boolean;
}

export interface ProductVariantAttributeValue {
  attributeId: number;
  attributeCode: string;
  attributeName: string;
  optionId: number;
  optionValue: string;
  optionLabel: string;
}

export interface ProductVariantTranslation {
  id: number;
  languageCode: string;
  name: string;
  description?: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  isDefault: boolean;
  isActive: boolean;
  imageId?: number;
  image?: MediaFile;
  displayOrder: number;
  createdAt: string;
  name: string;
  translations: ProductVariantTranslation[];
  attributeValues: ProductVariantAttributeValue[];
  prices: ProductPrice[];
  inventory: ProductInventory[];
}

export interface ProductAttributeValue {
  id: number;
  attributeId: number;
  attributeCode: string;
  attributeName: string;
  optionId?: number;
  optionValue?: string;
  optionLabel?: string;
  customValue?: string;
  displayOrder: number;
}

export interface ProductTag {
  id: number;
  slug: string;
  displayOrder: number;
  createdAt: string;
  name: string;
  translations: Array<{
    id: number;
    languageCode: string;
    name: string;
  }>;
}

export interface RelatedProduct {
  id: number;
  productId: number;
  relatedProductId: number;
  relationType: string;
  displayOrder: number;
  isBidirectional: boolean;
  relatedProduct: {
    id: number;
    slug: string;
    sku: string;
    name: string;
    isPublished: boolean;
    isFeatured: boolean;
    status: string;
    mainImage?: MediaFile;
    createdAt: string;
    updatedAt: string;
    price?: number;
    salePrice?: number | null;
    currencyCode?: string;
    currencySymbol?: string;
    discountPercent?: number | null;
    isOnSale: boolean;
    stockQuantity?: number | null;
  };
}

export interface ProductReview {
  id: number;
  productId: number;
  userId?: number;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title?: string;
  content: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductDetail {
  id: number;
  slug: string;
  sku: string;
  isPublished: boolean;
  isFeatured: boolean;
  productType: string;
  status: string;
  mainImageId?: number;
  mainImage?: MediaFile;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  specificationsJson?: string;
  hasWarranty: boolean;
  warrantyType?: string;
  postalMethod?: string;
  vendorName?: string;
  brandId?: number;
  brand?: Brand;
  translation?: ProductTranslation;
  translations: ProductTranslation[];
  categories?: ProductCategory[];
  images?: ProductImage[];
  prices?: ProductPrice[];
  inventory?: ProductInventory[];
  variants?: ProductVariant[];
  attributeValues?: ProductAttributeValue[];
  tags?: ProductTag[];
  relatedProducts?: RelatedProduct[];
  reviews?: ProductReview[];
  reviewCount?: number;
  averageRating?: number;
  ratingDistribution?: Array<{
    rating: number;
    count: number;
  }>;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  reviewCount: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

function buildLangQuery(langCode?: string): string {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append("langCode", langCode);
  return queryParams.toString();
}

function buildProductDetailEndpoint(
  slug: string,
  section?: string,
  langCode?: string
): string {
  const encodedSlug = encodeURIComponent(slug);
  const path = section
    ? `/api/ui/shop/products/${encodedSlug}/${section}`
    : `/api/ui/shop/products/${encodedSlug}`;
  const query = buildLangQuery(langCode);

  return query ? `${path}?${query}` : path;
}

/**
 * Get product by slug - basic info only
 * @param slug - Product slug
 * @param langCode - Language code for translations
 * @returns Product basic info
 */
export async function getProductBySlug(
  slug: string,
  langCode?: string
): Promise<ProductDetail> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, undefined, langCode)
  )) as ProductDetail;

  return response;
}

/**
 * Get product images
 */
export async function getProductImages(
  slug: string,
  langCode?: string
): Promise<ProductImage[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "images", langCode)
  )) as ProductImage[];

  return response;
}

/**
 * Get product prices
 */
export async function getProductPrices(
  slug: string,
  langCode?: string
): Promise<ProductPrice[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "prices", langCode)
  )) as ProductPrice[];

  return response;
}

/**
 * Get product inventory
 */
export async function getProductInventory(
  slug: string,
  langCode?: string
): Promise<ProductInventory[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "inventory", langCode)
  )) as ProductInventory[];

  return response;
}

/**
 * Get product variants
 */
export async function getProductVariants(
  slug: string,
  langCode?: string
): Promise<ProductVariant[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "variants", langCode)
  )) as ProductVariant[];

  return response;
}

/**
 * Get product attribute values
 */
export async function getProductAttributes(
  slug: string,
  langCode?: string
): Promise<ProductAttributeValue[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "attributes", langCode)
  )) as ProductAttributeValue[];

  return response;
}

/**
 * Get product categories
 */
export async function getProductCategories(
  slug: string,
  langCode?: string
): Promise<ProductCategory[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "categories", langCode)
  )) as ProductCategory[];

  return response;
}

/**
 * Get product tags
 */
export async function getProductTags(
  slug: string,
  langCode?: string
): Promise<ProductTag[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "tags", langCode)
  )) as ProductTag[];

  return response;
}

/**
 * Get related products
 */
export async function getRelatedProducts(
  slug: string,
  langCode?: string
): Promise<RelatedProduct[]> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "related", langCode)
  )) as RelatedProduct[];

  return response;
}

/**
 * Get product reviews
 */
export async function getProductReviews(
  slug: string,
  langCode?: string
): Promise<ProductReviewsResponse> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "reviews", langCode)
  )) as ProductReviewsResponse;

  return response;
}

export interface CreateProductReviewRequest {
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title?: string;
  content: string;
}

/**
 * Create a product review
 */
export async function createProductReview(
  slug: string,
  review: CreateProductReviewRequest,
  langCode?: string
): Promise<ProductReview> {
  const response = (await apiRequest(
    buildProductDetailEndpoint(slug, "reviews", langCode),
    {
      method: "POST",
      body: JSON.stringify(review),
    }
  )) as ProductReview;

  return response;
}
export interface ProductDetailResponse {
  product: ProductDetail;
  selectedVariantId: number | null;

  pricing: {
    current: ProductPrice | null;
    byVariant: Record<string, ProductPrice>;
  };

  inventory: {
    current: ProductInventory | null;
    byVariant: Record<string, ProductInventory>;
    isInStock: boolean;
  };

  reviews: {
    items: ProductReview[];
    reviewCount: number;
    averageRating: number;
    ratingDistribution: number[];
  };
}

/**
 * Get full product detail from the new aggregated endpoint
 * @param slug - Product slug
 * @param langCode - Language code
 */
export async function getProductDetail(
  slug: string,
  langCode?: string
): Promise<ProductDetailResponse> {
  const params = new URLSearchParams();

  if (langCode) params.append("langCode", langCode);

  const url = `/api/ui/shop/products/${encodeURIComponent(slug)}/detail${
    params.toString() ? `?${params}` : ""
  }`;

  return apiRequest(url);
}
