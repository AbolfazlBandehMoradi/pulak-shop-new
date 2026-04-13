import { apiRequest } from './api'

export interface ActivePaymentGateway {
  id: number
  providerName: string
  displayName: string
  iconUrl: string | null
  displayOrder: number
}

function mapGateway(raw: Record<string, unknown>): ActivePaymentGateway {
  return {
    id: (raw.id as number) ?? (raw.Id as number),
    providerName: (raw.providerName as string) ?? (raw.ProviderName as string) ?? '',
    displayName: (raw.displayName as string) ?? (raw.DisplayName as string) ?? '',
    iconUrl: (raw.iconUrl as string | null) ?? (raw.IconUrl as string | null) ?? null,
    displayOrder: (raw.displayOrder as number) ?? (raw.DisplayOrder as number) ?? 0
  }
}

export async function getActivePaymentGateways(): Promise<ActivePaymentGateway[]> {
  const response = await apiRequest('/api/ui/general/payment-gateways') as unknown[]
  return (response ?? []).map((r) => mapGateway(r as Record<string, unknown>))
}
