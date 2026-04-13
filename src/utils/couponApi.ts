import { apiRequest } from './api'

export interface Coupon {
  id: number
  code: string
  description?: string
  discountType: string
  discountValue: number
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  usageCount: number
  usageLimitPerUser?: number
  isActive: boolean
  isPublished: boolean
  currencyCode?: string
  createdAt: string
  updatedAt: string
}

export interface ValidateCouponRequest {
  code: string
  orderAmount: number
  currencyCode?: string
}

export interface ValidateCouponResponse {
  isValid: boolean
  coupon?: Coupon
  discountAmount: number
  message?: string
}

/**
 * Get coupon by code
 */
export async function getCouponByCode(code: string): Promise<Coupon> {
  return apiRequest<Coupon>(`/api/coupons/by-code/${encodeURIComponent(code)}`)
}

/**
 * Validate coupon for an order
 */
export async function validateCoupon(
  request: ValidateCouponRequest,
  langCode?: string
): Promise<ValidateCouponResponse> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  // For now, we'll validate on the frontend by fetching the coupon
  // In a real app, you'd have a dedicated validation endpoint
  try {
    const coupon = await getCouponByCode(request.code)
    
    // Basic validation
    if (!coupon.isActive || !coupon.isPublished) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon is not active',
      }
    }

    // Check dates
    const now = new Date()
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon is not yet valid',
      }
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon has expired',
      }
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && request.orderAmount < coupon.minimumOrderAmount) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Minimum order amount is ${coupon.minimumOrderAmount}`,
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'Percentage') {
      discountAmount = (request.orderAmount * coupon.discountValue) / 100
      if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
        discountAmount = coupon.maximumDiscountAmount
      }
    } else if (coupon.discountType === 'FixedAmount') {
      discountAmount = coupon.discountValue
      if (discountAmount > request.orderAmount) {
        discountAmount = request.orderAmount
      }
    }

    return {
      isValid: true,
      coupon,
      discountAmount,
    }
  } catch (error) {
    return {
      isValid: false,
      discountAmount: 0,
      message: error instanceof Error ? error.message : 'Invalid coupon code',
    }
  }
}

