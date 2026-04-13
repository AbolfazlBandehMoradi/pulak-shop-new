import { apiRequest } from './api'

export interface Province {
  id: number
  name: string
  code?: string
  countryId: number
  countryName: string
  countryCode: string
  isActive: boolean
  displayOrder: number
  cityCount: number
}

export interface City {
  id: number
  name: string
  code?: string
  provinceId: number
  provinceName: string
  countryId: number
  countryName: string
  countryCode: string
  isActive: boolean
  displayOrder: number
}

export interface UserAddress {
  id: number
  userId: number
  userName: string
  userEmail: string
  title?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  alternativePhoneNumber?: string
  streetAddress1: string
  streetAddress2?: string
  postalCode: string
  countryId: number
  countryName: string
  provinceId: number
  provinceName: string
  cityId: number
  cityName: string
  additionalDetails?: string
  latitude?: number
  longitude?: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SaveAddressRequest {
  id?: number
  title?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  alternativePhoneNumber?: string
  streetAddress1: string
  streetAddress2?: string
  postalCode: string
  provinceId: number
  cityId: number
  additionalDetails?: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}

const TEMP_ADDRESS_KEY = 'checkout_temp_address'

/**
 * Get user addresses (for authenticated users)
 */
export async function getUserAddresses(langCode?: string): Promise<UserAddress[]> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const response = await apiRequest(
    `/api/ui/checkout/addresses?${queryParams.toString()}`,
    {
      method: 'GET',
    }
  ) as UserAddress[]

  return response
}

/**
 * Get provinces for Iran
 */
export async function getProvinces(langCode?: string): Promise<Province[]> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const response = await apiRequest(
    `/api/ui/checkout/provinces?${queryParams.toString()}`,
    {
      method: 'GET',
    }
  ) as Province[]

  return response
}

/**
 * Get cities for a province
 */
export async function getCities(provinceId: number, langCode?: string): Promise<City[]> {
  const queryParams = new URLSearchParams()
  queryParams.append('provinceId', provinceId.toString())
  if (langCode) queryParams.append('langCode', langCode)

  const response = await apiRequest(
    `/api/ui/checkout/cities?${queryParams.toString()}`,
    {
      method: 'GET',
    }
  ) as City[]

  return response
}

/**
 * Save address (create or update)
 */
export async function saveAddress(
  request: SaveAddressRequest,
  langCode?: string
): Promise<UserAddress> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  const response = await apiRequest(
    `/api/ui/checkout/address?${queryParams.toString()}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  ) as UserAddress

  return response
}

/**
 * Set default address
 */
export async function setDefaultAddress(
  addressId: number,
  langCode?: string
): Promise<void> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  await apiRequest(
    `/api/ui/checkout/address/${addressId}/set-default?${queryParams.toString()}`,
    {
      method: 'POST',
    }
  )
}

/**
 * Delete an address
 */
export async function deleteAddress(
  addressId: number,
  langCode?: string
): Promise<void> {
  const queryParams = new URLSearchParams()
  if (langCode) queryParams.append('langCode', langCode)

  await apiRequest(
    `/api/ui/checkout/address/${addressId}?${queryParams.toString()}`,
    {
      method: 'DELETE',
    }
  )
}

/**
 * Store temporary address in localStorage (for non-authenticated users)
 */
export function storeTempAddress(address: SaveAddressRequest): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TEMP_ADDRESS_KEY, JSON.stringify(address))
}

/**
 * Get temporary address from localStorage
 */
export function getTempAddress(): SaveAddressRequest | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(TEMP_ADDRESS_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as SaveAddressRequest
  } catch {
    return null
  }
}

/**
 * Clear temporary address from localStorage
 */
export function clearTempAddress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TEMP_ADDRESS_KEY)
}


