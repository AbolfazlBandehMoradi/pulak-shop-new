import { apiRequest, isTokenExpired } from './api'

const AUTH_TOKEN_KEY = 'auth_token'
const CART_SESSION_KEY = 'cart_session_id'

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
  stockQuantity?: number | null
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

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return false
  return !isTokenExpired(token)
}

export function getCartSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_SESSION_KEY)
}

export function setCartSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_SESSION_KEY, sessionId)
}

export function clearCartSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_SESSION_KEY)
}

/**
 * Get current cart
 */
export async function getCart(langCode?: string): Promise<Cart> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const authenticated = isAuthenticated()
  const sessionId = getCartSessionId()
  const headers: Record<string, string> = {}
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId
  }

  const response = await apiRequest(
    `/api/cart?${queryParams.toString()}`,
    {
      method: 'GET',
      headers,
    }
  ) as Cart

  // After authenticated cart is resolved, guest session is no longer needed.
  if (authenticated && sessionId) {
    clearCartSessionId()
  }

  return response
}

/**
 * Add item to cart
 */
export async function addCartItem(
  request: AddCartItemRequest,
  langCode?: string
): Promise<Cart> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const headers: Record<string, string> = {}
  if (!isAuthenticated()) {
    let sessionId = getCartSessionId()
    if (!sessionId) {
      sessionId = generateSessionId()
      setCartSessionId(sessionId)
    }
    headers['X-Cart-Session-Id'] = sessionId
  }

  const response = await apiRequest(
    `/api/cart/items?${queryParams.toString()}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    }
  ) as Cart

  return response
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: number,
  request: UpdateCartItemRequest,
  langCode?: string
): Promise<Cart> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const sessionId = !isAuthenticated() ? getCartSessionId() : null
  const headers: Record<string, string> = {}
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId
  }

  const response = await apiRequest(
    `/api/cart/items/${itemId}?${queryParams.toString()}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
    }
  ) as Cart

  return response
}

/**
 * Remove item from cart
 */
export async function removeCartItem(
  itemId: number,
  langCode?: string
): Promise<Cart> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const sessionId = !isAuthenticated() ? getCartSessionId() : null
  const headers: Record<string, string> = {}
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId
  }

  const response = await apiRequest(
    `/api/cart/items/${itemId}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers,
    }
  ) as Cart

  return response
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

