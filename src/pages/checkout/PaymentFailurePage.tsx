import { XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from '@/components/ui/Button'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'

const REASON_MESSAGE_KEYS: Record<string, string> = {
  gateway_callback: 'payment.failureReason.gatewayCallback',
  order_not_found: 'payment.failureReason.orderNotFound',
  track_id_mismatch: 'payment.failureReason.trackIdMismatch',
  gateway_not_found: 'payment.failureReason.gatewayNotFound',
  verify_failed: 'payment.failureReason.verifyFailed',
  verify_error: 'payment.failureReason.verifyError',
  system_busy: 'payment.systemBusyMessage',
}

const REASON_TITLE_KEYS: Record<string, string> = {
  system_busy: 'payment.systemBusyTitle',
}

type DebugRow = { label: string; value: string }

function buildDebugRows(searchParams: URLSearchParams): DebugRow[] {
  const keys = [
    'reason',
    'provider',
    'cmsOrderId',
    'orderId',
    'gatewaySuccess',
    'gatewayStatus',
    'trackId',
    'storedTrackId',
    'verifyCode',
    'verifyMessage',
    'verifyStatus',
    'detail',
  ] as const

  return keys
    .map((key) => ({ label: key, value: searchParams.get(key) ?? '' }))
    .filter((row) => row.value.length > 0)
}

export default function PaymentFailurePage() {
  const navigate = useLocalizedNavigate()
  const { t } = useTranslation()
  const dir = useLangStore((s) => s.dir)
  const [searchParams] = useSearchParams()

  const reason = searchParams.get('reason') ?? ''
  const isSystemBusy = reason === 'system_busy'
  const debugRows = buildDebugRows(searchParams)
  const hasDebugInfo = debugRows.length > 0

  const titleKey = REASON_TITLE_KEYS[reason]
  const messageKey = REASON_MESSAGE_KEYS[reason]

  const title = titleKey
    ? (t(titleKey) || (isSystemBusy ? 'System Busy' : 'Payment Failed'))
    : (t('payment.failureTitle') || 'Payment Failed')

  const message = messageKey
    ? (t(messageKey) || t('payment.failureMessage') || 'Your payment could not be completed. Please try again.')
    : (t('payment.failureMessage') || 'Your payment could not be completed. Please try again.')

  return (
    <div dir={dir} className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg w-full">
        <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{message}</p>

        {hasDebugInfo && (
          <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4 text-start text-sm">
            <p className="font-semibold mb-3 text-foreground">
              {t('payment.failureDebugTitle') || 'Payment debug details'}
            </p>
            <dl className="space-y-2">
              {debugRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[9rem_1fr] gap-2">
                  <dt className="text-muted-foreground font-mono text-xs">{row.label}</dt>
                  <dd className="break-all font-mono text-xs text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              {t('payment.failureDebugHint') ||
                'Share these details with support if the problem continues.'}
            </p>
          </div>
        )}

        <Button variant="outline" onClick={() => navigate(`/payment`)}>
          {t('payment.tryAgain') || 'Try Again'}
        </Button>
      </div>
    </div>
  )
}
