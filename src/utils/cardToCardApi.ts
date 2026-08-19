import { apiRequest } from './api'
import type { MediaFile } from './shopApi'

export interface CardToCardSettings {
  cardToCardEnabled: boolean
  cardToCardNumber: string
  cardToCardAccountHolder: string
  cardToCardFields: CardToCardFields
}

export interface CardToCardSubmitRequest {
  transactionReferenceId?: string
  paymentCardNumber?: string
  sourceCardNumber?: string
  sourceCardOwnerName?: string
  receiptImageMediaId?: number
}

export interface CardToCardSubmitResponse {
  orderId: number
  orderNumber: string
  message: string
}

function getCartSessionHeaders(): Record<string, string> {
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') : null
  return sessionId ? { 'X-Cart-Session-Id': sessionId } : {}
}

function appendLangCode(url: string, langCode?: string): string {
  if (!langCode) return url
  const params = new URLSearchParams({ langCode })
  return `${url}?${params.toString()}`
}

export type CardToCardFieldKey =
  | 'transactionReferenceId'
  | 'sourceCardNumber'
  | 'sourceCardOwnerName'
  | 'receiptImage'

export interface CardToCardFieldConfig {
  show: boolean
  required: boolean
}

export type CardToCardFields = Record<CardToCardFieldKey, CardToCardFieldConfig>

export const DEFAULT_CARD_TO_CARD_FIELDS: CardToCardFields = {
  transactionReferenceId: { show: true, required: true },
  sourceCardNumber: { show: true, required: true },
  sourceCardOwnerName: { show: false, required: false },
  receiptImage: { show: true, required: true },
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function toBooleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function mapCardToCardFieldConfig(
  rawValue: unknown,
  fallback: CardToCardFieldConfig
): CardToCardFieldConfig {
  const raw = toObject(rawValue)
  if (!raw) return fallback

  return {
    show: toBooleanValue(raw.show ?? raw.Show, fallback.show),
    required: toBooleanValue(raw.required ?? raw.Required, fallback.required),
  }
}

function mapCardToCardFields(rawValue: unknown): CardToCardFields {
  const raw = toObject(rawValue)

  return {
    transactionReferenceId: mapCardToCardFieldConfig(
      raw?.transactionReferenceId ?? raw?.TransactionReferenceId,
      DEFAULT_CARD_TO_CARD_FIELDS.transactionReferenceId
    ),
    sourceCardNumber: mapCardToCardFieldConfig(
      raw?.sourceCardNumber ?? raw?.SourceCardNumber ?? raw?.paymentCardNumber,
      DEFAULT_CARD_TO_CARD_FIELDS.sourceCardNumber
    ),
    sourceCardOwnerName: mapCardToCardFieldConfig(
      raw?.sourceCardOwnerName ?? raw?.SourceCardOwnerName,
      DEFAULT_CARD_TO_CARD_FIELDS.sourceCardOwnerName
    ),
    receiptImage: mapCardToCardFieldConfig(
      raw?.receiptImage ?? raw?.ReceiptImage,
      DEFAULT_CARD_TO_CARD_FIELDS.receiptImage
    ),
  }
}

function mapCardToCardSettings(raw: Record<string, unknown>): CardToCardSettings {
  return {
    cardToCardEnabled: Boolean(
      raw.cardToCardEnabled ??
        raw.CardToCardEnabled ??
        raw.isCardToCardEnabled ??
        raw.IsCardToCardEnabled
    ),
    cardToCardNumber: toStringValue(
      raw.cardToCardNumber ?? raw.CardToCardNumber ?? raw.cardNumber ?? raw.CardNumber
    ),
    cardToCardAccountHolder: toStringValue(
      raw.cardToCardAccountHolder ??
        raw.CardToCardAccountHolder ??
        raw.accountHolder ??
        raw.AccountHolder
    ),
    cardToCardFields: mapCardToCardFields(raw.cardToCardFields ?? raw.CardToCardFields),
  }
}

export async function getCardToCardSettings(langCode?: string): Promise<CardToCardSettings> {
  const response = await apiRequest(
    appendLangCode('/api/ui/settings/payment', langCode)
  )
  return mapCardToCardSettings((response ?? {}) as Record<string, unknown>)
}

export async function uploadCardToCardReceiptImage(
  file: File,
  langCode?: string
): Promise<MediaFile> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<MediaFile>(
    appendLangCode('/api/ui/payment/card-to-card/upload-receipt', langCode),
    {
      method: 'POST',
      body: formData,
    }
  )
}

export async function submitCardToCardPayment(
  payload: CardToCardSubmitRequest,
  langCode?: string
): Promise<CardToCardSubmitResponse> {
  return apiRequest<CardToCardSubmitResponse>(
    appendLangCode('/api/ui/payment/card-to-card', langCode),
    {
      method: 'POST',
      headers: getCartSessionHeaders(),
      body: JSON.stringify(payload),
    }
  )
}
