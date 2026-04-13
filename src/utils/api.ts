import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import apiClient from '@/services/apiClient'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

type ApiErrorPayload = {
  detail?: string
  title?: string
  message?: string
  errors?: Record<string, string[] | string>
}

interface LoginResponse {
  token: string
  refreshToken: string
  user?: unknown
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, unknown>
}

// Store a flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

/**
 * Get the authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
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

/**
 * Attempt to refresh the authentication token
 */
async function attemptTokenRefresh(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        return null
      }

      const response = await apiClient.post<LoginResponse>(
        normalizeEndpoint('/api/ui/auth/refresh'),
        { refreshToken }
      )

      // Update tokens in localStorage
      localStorage.setItem(TOKEN_KEY, response.data.token)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken)

      if (response.data.user !== undefined) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
      }

      let refreshedUser: unknown = null
      if (response.data.user !== undefined) {
        refreshedUser = response.data.user
      } else {
        const storedUser = localStorage.getItem('auth_user')
        if (storedUser) {
          try {
            refreshedUser = JSON.parse(storedUser)
          } catch {
            localStorage.removeItem('auth_user')
          }
        }
      }

      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(
        new CustomEvent('auth-token-refreshed', {
          detail: { token: response.data.token, user: refreshedUser },
        })
      )

      return response.data.token
    } catch {
      // Refresh failed - clear auth data and notify AuthContext
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem('auth_user')

      window.dispatchEvent(new CustomEvent('auth-token-expired'))
      return null
    } finally {
      isRefreshing = false
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
      const newToken = await attemptTokenRefresh()

      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`
        const retryResponse = await apiClient.request<T>({
          ...requestConfig,
          headers,
        })
        if (retryResponse.status === 204) {
          return undefined as T
        }
        return retryResponse.data
      }

      throw new Error('AUTH_EXPIRED')
    }

    throw createApiError(error)
  }
}

