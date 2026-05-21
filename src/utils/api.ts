import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import apiClient from '@/services/apiClient'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'
const UNAUTHORIZED_STATUSES = new Set([401, 403])

type ApiErrorPayload = {
  detail?: string
  title?: string
  message?: string
  errors?: Record<string, string[] | string>
}

interface LoginResponse {
  token: string
  refreshToken: string
  expiresAt?: string
  user?: unknown
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, unknown>
}

export interface TokenRefreshedEventDetail {
  token: string
  user: unknown | null
}

export type AuthRefreshResult =
  | {
      status: 'success'
      token: string
      refreshToken: string
      expiresAt: string | null
      user: unknown | null
    }
  | {
      status: 'no_refresh_token' | 'unauthorized' | 'network_error' | 'error'
      error?: Error & { status?: number }
    }

let refreshPromise: Promise<AuthRefreshResult> | null = null

/**
 * Get the authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

function decodeBase64Url(value: string): string | null {
  if (typeof atob !== 'function') {
    return null
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)

  try {
    return atob(`${normalized}${padding}`)
  } catch {
    return null
  }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  const decodedPayload = decodeBase64Url(parts[1])
  if (!decodedPayload) {
    return null
  }

  try {
    return JSON.parse(decodedPayload) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTokenExpiryTimestamp(token: string): number | null {
  const payload = decodeJwtPayload(token)
  const expValue = payload?.exp

  const exp =
    typeof expValue === 'number'
      ? expValue
      : typeof expValue === 'string'
      ? Number(expValue)
      : Number.NaN

  if (!Number.isFinite(exp)) {
    return null
  }

  return exp * 1000
}

export function isTokenExpired(token: string, skewSeconds: number = 0): boolean {
  const expiryTimestamp = getTokenExpiryTimestamp(token)
  if (expiryTimestamp == null) {
    return true
  }

  return Date.now() >= expiryTimestamp - skewSeconds * 1000
}

export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = 0
): boolean {
  return isTokenExpired(token, thresholdSeconds)
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {}

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return { ...headers }
}

function shouldSetJsonContentType(
  headers: Record<string, string>,
  body: BodyInit | null | undefined
) {
  if (!body || body instanceof FormData) {
    return false
  }

  return !Object.keys(headers).some(
    (header) => header.toLowerCase() === 'content-type'
  )
}

function normalizeEndpoint(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const baseURL = (apiClient.defaults.baseURL || '').toLowerCase()
  const isBaseApi = baseURL.endsWith('/api')

  if (isBaseApi && normalizedEndpoint.startsWith('/api/')) {
    return normalizedEndpoint.slice(4)
  }

  if (isBaseApi && normalizedEndpoint === '/api') {
    return '/'
  }

  return normalizedEndpoint
}

function parseApiError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Request failed'
  }

  const errorPayload = data as ApiErrorPayload
  let errorMessage =
    errorPayload.detail || errorPayload.title || errorPayload.message || 'Request failed'

  if (errorPayload.errors && typeof errorPayload.errors === 'object') {
    const firstError = Object.values(errorPayload.errors)[0]
    if (Array.isArray(firstError) && firstError.length > 0) {
      errorMessage = firstError[0]
    } else if (typeof firstError === 'string') {
      errorMessage = firstError
    }
  }

  return errorMessage
}

function createApiError(error: unknown): Error & { status?: number } {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const errorMessage =
      parseApiError(error.response?.data) ||
      (status ? `HTTP error! status: ${status}` : 'Request failed')

    const parsedError = new Error(errorMessage) as Error & { status?: number }
    parsedError.status = status
    return parsedError
  }

  return error instanceof Error ? error : new Error('Request failed')
}

function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false
  }

  if (!error.response) {
    return true
  }

  return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED'
}

function clearStoredAuthState() {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function dispatchTokenRefreshed(detail: TokenRefreshedEventDetail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent<TokenRefreshedEventDetail>('auth-token-refreshed', {
      detail,
    })
  )
}

function dispatchTokenExpired() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent('auth-token-expired'))
}

/**
 * Refresh the authentication token with a single shared in-flight promise.
 */
export async function refreshAccessToken(): Promise<AuthRefreshResult> {
  if (typeof window === 'undefined') {
    return {
      status: 'error',
      error: new Error('Token refresh is unavailable on server'),
    }
  }

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefreshToken) {
      clearStoredAuthState()
      dispatchTokenExpired()
      return { status: 'no_refresh_token' } as const
    }

    try {
      const response = await apiClient.post<LoginResponse>(
        normalizeEndpoint('/api/ui/auth/refresh'),
        { refreshToken: storedRefreshToken }
      )

      localStorage.setItem(TOKEN_KEY, response.data.token)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken)

      const nextUser = response.data.user ?? null
      if (response.data.user !== undefined && response.data.user !== null) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
      } else {
        localStorage.removeItem(USER_KEY)
      }

      dispatchTokenRefreshed({
        token: response.data.token,
        user: nextUser,
      })

      return {
        status: 'success',
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt ?? null,
        user: nextUser,
      } as const
    } catch (error) {
      const parsedError = createApiError(error)
      const status = parsedError.status
      if (status != null && UNAUTHORIZED_STATUSES.has(status)) {
        clearStoredAuthState()
        dispatchTokenExpired()
        return { status: 'unauthorized', error: parsedError } as const
      }

      if (isNetworkError(error)) {
        return { status: 'network_error', error: parsedError } as const
      }

      return { status: 'error', error: parsedError } as const
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Make an API request to the backend
 * @param endpoint - The API endpoint (e.g., '/api/ui/settings/shop')
 * @param options - Request options
 * @param retryOn401 - Whether to retry the request after token refresh on 401 (default: true)
 * @returns The response data
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
  retryOn401: boolean = true
): Promise<T> {
  const headers = toHeaderRecord(options.headers)
  if (shouldSetJsonContentType(headers, options.body)) {
    headers['Content-Type'] = 'application/json'
  }

  // Add Authorization header if token is available
  let token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const requestConfig: AxiosRequestConfig = {
    url: normalizeEndpoint(endpoint),
    method: options.method || 'GET',
    headers,
    data: options.body,
    params: options.params,
    signal: options.signal ?? undefined,
    withCredentials: options.credentials === 'include',
  }

  try {
    const response = await apiClient.request<T>(requestConfig)
    if (response.status === 204) {
      return undefined as T
    }
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && retryOn401 && token) {
      const refreshResult = await refreshAccessToken()

      if (refreshResult.status === 'success') {
        headers.Authorization = `Bearer ${refreshResult.token}`
        const retryResponse = await apiClient.request<T>({
          ...requestConfig,
          headers,
        })
        if (retryResponse.status === 204) {
          return undefined as T
        }
        return retryResponse.data
      }

      if (
        refreshResult.status === 'unauthorized' ||
        refreshResult.status === 'no_refresh_token'
      ) {
        throw new Error('AUTH_EXPIRED')
      }

      if (refreshResult.error) {
        throw refreshResult.error
      }

      throw new Error('Request failed')
    }

    throw createApiError(error)
  }
}

