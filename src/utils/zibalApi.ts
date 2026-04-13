import { apiRequest } from './api'

export interface ZibalRequestResponse {
  redirectUrl: string
  orderId: number
  trackId: string
}

export async function requestZibalPayment(
  langCode?: string,
  gatewayId?: number
): Promise<ZibalRequestResponse> {
  const params = new URLSearchParams()
  if (langCode) params.append('langCode', langCode)
  if (gatewayId != null) params.append('gatewayId', String(gatewayId))
  const query = params.toString()
  const url = `/api/zibal/request${query ? `?${query}` : ''}`
  const headers: Record<string, string> = {}
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') : null
  if (sessionId) headers['X-Cart-Session-Id'] = sessionId
  return apiRequest(url, { method: 'POST', headers }) as Promise<ZibalRequestResponse>
}
