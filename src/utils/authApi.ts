import { apiRequest } from './api'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  captchaCode?: string
  captchaToken?: string
}

export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  roleIds: number[]
  permissions: string[]
  avatar?: {
    id: number
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
    [key: string]: unknown
  }
  avatarId?: number
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresAt: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Login user
 * @param credentials - Login credentials
 * @returns Login response with token and user info
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest('/api/ui/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, false) as Promise<LoginResponse>
}

/**
 * Refresh authentication token
 * @param refreshToken - Refresh token
 * @returns New login response with updated tokens
 */
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  const request: RefreshTokenRequest = { refreshToken }
  return apiRequest('/api/ui/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(request),
  }, false) as Promise<LoginResponse>
}

export interface SendOtpRequest {
  mobile: string
}

export interface SendOtpResponse {
  message: string
  mobile: string
}

export interface VerifyOtpRequest {
  mobile: string
  otpCode: string
  rememberMe?: boolean
}

/**
 * Send OTP code to mobile number
 * @param mobile - Mobile phone number
 * @param langCode - Optional language code
 * @returns Response with success message
 */
export async function sendOtp(mobile: string, langCode?: string | null): Promise<SendOtpResponse> {
  const request: SendOtpRequest = { mobile }
  const queryParams = langCode ? `?langCode=${encodeURIComponent(langCode)}` : ''
  return apiRequest(`/api/ui/auth/send-otp-for-phone-auth${queryParams}`, {
    method: 'POST',
    body: JSON.stringify(request),
  }, false) as Promise<SendOtpResponse>
}

/**
 * Verify OTP code and login
 * @param request - OTP verification request
 * @returns Login response with token and user info
 */
export async function verifyOtp(request: VerifyOtpRequest): Promise<LoginResponse> {
  return apiRequest(`/api/ui/auth/verify-otp-for-phone-auth`, {
    method: 'POST',
    body: JSON.stringify(request),
  }, false) as Promise<LoginResponse>
}

export interface SendOtpForRegistrationRequest {
  mobile?: string
  email?: string
  captchaCode?: string
  captchaToken?: string
}

export interface SendOtpForRegistrationResponse {
  message: string
  mobile?: string
  email?: string
}

export interface RegisterRequest {
  mobile?: string
  email?: string
  otpCode: string
  rememberMe?: boolean
  captchaCode?: string
  captchaToken?: string
}

/**
 * Send OTP code for registration
 * @param request - Registration OTP request (mobile or email)
 * @param langCode - Optional language code
 * @returns Response with success message
 */
export async function sendOtpForRegistration(
  request: SendOtpForRegistrationRequest,
  langCode?: string | null
): Promise<SendOtpForRegistrationResponse> {
  const queryParams = langCode ? `?langCode=${encodeURIComponent(langCode)}` : ''
  return apiRequest(`/api/ui/auth/send-otp-for-registration${queryParams}`, {
    method: 'POST',
    body: JSON.stringify(request),
  }, false) as Promise<SendOtpForRegistrationResponse>
}

/**
 * Register a new user with OTP verification
 * @param request - Registration request
 * @param langCode - Optional language code
 * @returns Login response with token and user info
 */
export async function register(request: RegisterRequest, langCode?: string | null): Promise<LoginResponse> {
  const queryParams = langCode ? `?langCode=${encodeURIComponent(langCode)}` : ''
  return apiRequest(`/api/ui/auth/register${queryParams}`, {
    method: 'POST',
    body: JSON.stringify(request),
  }, false) as Promise<LoginResponse>
}

export interface GenerateCaptchaResponse {
  success: boolean
  captchaToken: string
  image: string
}

/**
 * Generate a new captcha image
 * @returns Captcha response with token and base64 image
 */
export async function generateCaptcha(): Promise<GenerateCaptchaResponse> {
  return apiRequest('/api/ui/auth/generate-captcha', {
    method: 'GET',
  }, false) as Promise<GenerateCaptchaResponse>
}

