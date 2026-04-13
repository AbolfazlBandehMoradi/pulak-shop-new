import { apiRequest } from './api'

export interface ZarinPalRequestResponse {
  redirectUrl: string
  orderId: number
  authority: string
}

export async function requestZarinPalPayment(
  langCode?: string,
  gatewayId?: number
): Promise<ZarinPalRequestResponse> {
  const params = new URLSearchParams()
  if (langCode) params.append('langCode', langCode)
  if (gatewayId != null) params.append('gatewayId', String(gatewayId))
  const query = params.toString()
  const url = `/api/zarinpal/request${query ? `?${query}` : ''}`
  const headers: Record<string, string> = {}
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') : null
  if (sessionId) headers['X-Cart-Session-Id'] = sessionId
  return apiRequest(url, { method: 'POST', headers }) as Promise<ZarinPalRequestResponse>
}
