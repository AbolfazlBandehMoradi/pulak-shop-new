import { apiRequest } from './api'

export interface Wallet {
  id: number
  userId: number
  balance: number
  currencyCode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Get wallet by user ID (requires authentication)
 */
export async function getWalletByUserId(userId: number): Promise<Wallet | null> {
  try {
    return apiRequest<Wallet>(`/api/wallets/by-user/${userId}`)
  } catch (error) {
    console.error('Failed to get wallet:', error)
    return null
  }
}

