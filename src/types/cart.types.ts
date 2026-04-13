export interface CartItem {
  id: number
  productId: number
  variantId?: number
  quantity: number
  createdAt: string
  productSlug: string
  productName: string
  productImage?: {
    id: number
    fileName: string
    filePath: string
    thumbnailPath?: string
    alt?: string
    title?: string
  }
  variantName?: string
  variantAttributes: Array<{
    attributeCode: string
    attributeName: string
    optionValue: string
    optionLabel: string
    colorCode?: string
  }>
  unitPrice: number
  unitSalePrice?: number
  unitDiscount: number
  lineTotal: number
  lineDiscount: number
  lineFinalPrice: number
  warrantyType?: string
  vendorName?: string
  currencyCode: string
  currencySymbol: string
}

export interface Cart {
  id: number
  userId?: number
  sessionId?: string
  currencyCode: string
  currencySymbol: string
  createdAt: string
  updatedAt: string
  items: CartItem[]
  subtotal: number
  totalDiscount: number
  total: number
  itemCount: number
}

export interface AddCartItemRequest {
  productId: number
  variantId?: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}