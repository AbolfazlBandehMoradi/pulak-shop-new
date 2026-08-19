import { apiRequest, isTokenExpired } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const CART_SESSION_KEY = 'cart_session_id';
const CART_DELIVERY_METHOD_KEY = 'checkout_cart_delivery_method';

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  createdAt: string;
  productSlug: string;
  productName: string;
  productImage?: {
    id: number;
    fileName: string;
    filePath: string;
    thumbnailPath?: string;
    alt?: string;
    title?: string;
  };
  variantName?: string;
  variantAttributes: Array<{
    attributeCode: string;
    attributeName: string;
    optionValue: string;
    optionLabel: string;
    colorCode?: string;
  }>;
  unitPrice: number;
  unitSalePrice?: number;
  unitDiscount: number;
  lineTotal: number;
  lineDiscount: number;
  lineFinalPrice: number;
  specificationsJson?: string;
  warrantyType?: string;
  vendorName?: string;
  currencyCode: string;
  currencySymbol: string;
  stockQuantity?: number | null;
}

export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  currencyCode: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  shippingAmount: number;
  appliedDeliveryMethodId?: number | null;
  total: number;
  itemCount: number;
}

export interface AddCartItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return false;
  return !isTokenExpired(token);
}

export function getCartSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_SESSION_KEY);
}

export function setCartSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_SESSION_KEY, sessionId);
}

export function clearCartSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_SESSION_KEY);
}

interface StoredCartDeliveryMethod {
  cartId: number | null;
  deliveryMethodId: number;
}

function normalizeDeliveryMethodId(value: unknown): number | null {
  const deliveryMethodId = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(deliveryMethodId) && deliveryMethodId > 0 ? deliveryMethodId : null;
}

function readStoredCartDeliveryMethod(): StoredCartDeliveryMethod | null {
  if (typeof window === 'undefined') return null;

  const storedValue = localStorage.getItem(CART_DELIVERY_METHOD_KEY);
  if (!storedValue) return null;

  try {
    const parsed = JSON.parse(storedValue) as Partial<StoredCartDeliveryMethod> | number;
    if (typeof parsed === 'object' && parsed !== null) {
      const deliveryMethodId = normalizeDeliveryMethodId(parsed.deliveryMethodId);
      if (!deliveryMethodId) return null;

      const cartId =
        typeof parsed.cartId === 'number' && Number.isFinite(parsed.cartId) ? parsed.cartId : null;

      return { cartId, deliveryMethodId };
    }
  } catch {
    const deliveryMethodId = normalizeDeliveryMethodId(storedValue);
    return deliveryMethodId ? { cartId: null, deliveryMethodId } : null;
  }

  const deliveryMethodId = normalizeDeliveryMethodId(storedValue);
  return deliveryMethodId ? { cartId: null, deliveryMethodId } : null;
}

function getStoredCartDeliveryMethodId(cartId?: number): number | null {
  const storedDeliveryMethod = readStoredCartDeliveryMethod();
  if (!storedDeliveryMethod) return null;

  if (
    cartId != null &&
    storedDeliveryMethod.cartId != null &&
    storedDeliveryMethod.cartId !== cartId
  ) {
    return null;
  }

  return storedDeliveryMethod.deliveryMethodId;
}

function rememberCartDeliveryMethod(cart: Cart, fallbackDeliveryMethodId?: number): void {
  if (typeof window === 'undefined') return;

  if (!cart.items.length) {
    clearStoredCartDeliveryMethodId();
    return;
  }

  const deliveryMethodId =
    normalizeDeliveryMethodId(cart.appliedDeliveryMethodId) ??
    normalizeDeliveryMethodId(fallbackDeliveryMethodId);

  if (!deliveryMethodId) return;

  const storedDeliveryMethod: StoredCartDeliveryMethod = {
    cartId: cart.id,
    deliveryMethodId,
  };
  localStorage.setItem(CART_DELIVERY_METHOD_KEY, JSON.stringify(storedDeliveryMethod));
}

export function clearStoredCartDeliveryMethodId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_DELIVERY_METHOD_KEY);
}

function shouldForgetStoredDeliveryMethod(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return status === 400 || status === 404;
}

async function requestCartDeliveryMethod(
  deliveryMethodId: number,
  langCode?: string,
): Promise<Cart> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append('langCode', langCode);

  const sessionId = !isAuthenticated() ? getCartSessionId() : null;
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId;
  }

  return apiRequest(`/api/cart/delivery-method?${queryParams.toString()}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ deliveryMethodId }),
  }) as Promise<Cart>;
}

async function restoreStoredDeliveryMethod(cart: Cart, langCode?: string): Promise<Cart> {
  if (!cart.items.length) {
    clearStoredCartDeliveryMethodId();
    return cart;
  }

  rememberCartDeliveryMethod(cart);

  const storedDeliveryMethodId = getStoredCartDeliveryMethodId(cart.id);
  if (!storedDeliveryMethodId || cart.appliedDeliveryMethodId === storedDeliveryMethodId) {
    return cart;
  }

  try {
    const updatedCart = await requestCartDeliveryMethod(storedDeliveryMethodId, langCode);
    rememberCartDeliveryMethod(updatedCart, storedDeliveryMethodId);
    return updatedCart;
  } catch (error) {
    if (shouldForgetStoredDeliveryMethod(error)) {
      clearStoredCartDeliveryMethodId();
    }

    if (import.meta.env.DEV) {
      console.warn('[cartApi] failed to restore delivery method', error);
    }

    return cart;
  }
}

/**
 * Get current cart
 */
export async function getCart(langCode?: string): Promise<Cart> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append('langCode', langCode);

  const authenticated = isAuthenticated();
  const sessionId = getCartSessionId();
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId;
  }

  const response = (await apiRequest(`/api/cart?${queryParams.toString()}`, {
    method: 'GET',
    headers,
  })) as Cart;

  // The first authenticated cart fetch can merge a guest cart, then the
  // client should stop sending the old guest session.
  if (authenticated && sessionId) {
    clearCartSessionId();
  }

  return restoreStoredDeliveryMethod(response, langCode);
}

/**
 * Add item to cart
 */
export async function addCartItem(request: AddCartItemRequest, langCode?: string): Promise<Cart> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append('langCode', langCode);

  const headers: Record<string, string> = {};
  if (!isAuthenticated()) {
    let sessionId = getCartSessionId();
    if (!sessionId) {
      sessionId = generateSessionId();
      setCartSessionId(sessionId);
    }
    headers['X-Cart-Session-Id'] = sessionId;
  }

  const response = (await apiRequest(`/api/cart/items?${queryParams.toString()}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  })) as Cart;

  return restoreStoredDeliveryMethod(response, langCode);
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: number,
  request: UpdateCartItemRequest,
  langCode?: string,
): Promise<Cart> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append('langCode', langCode);

  const sessionId = !isAuthenticated() ? getCartSessionId() : null;
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId;
  }

  const response = (await apiRequest(`/api/cart/items/${itemId}?${queryParams.toString()}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(request),
  })) as Cart;

  return restoreStoredDeliveryMethod(response, langCode);
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: number, langCode?: string): Promise<Cart> {
  const queryParams = new URLSearchParams();
  if (langCode) queryParams.append('langCode', langCode);

  const sessionId = !isAuthenticated() ? getCartSessionId() : null;
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers['X-Cart-Session-Id'] = sessionId;
  }

  const response = (await apiRequest(`/api/cart/items/${itemId}?${queryParams.toString()}`, {
    method: 'DELETE',
    headers,
  })) as Cart;

  return restoreStoredDeliveryMethod(response, langCode);
}

/**
 * Apply a delivery method to the current cart and recalculate shipping
 */
export async function setCartDeliveryMethod(
  deliveryMethodId: number,
  langCode?: string,
): Promise<Cart> {
  const response = await requestCartDeliveryMethod(deliveryMethodId, langCode);
  rememberCartDeliveryMethod(response, deliveryMethodId);
  return response;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
