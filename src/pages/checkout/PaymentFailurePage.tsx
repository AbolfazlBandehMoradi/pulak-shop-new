import { AlertTriangle, CreditCard, LifeBuoy, ShoppingCart, XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/i18n/useTranslation'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'
import { PaymentResultShell } from './sections/PaymentResultShell'

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
  const eyebrow = isSystemBusy
    ? t('payment.systemBusyEyebrow') || 'Temporary issue'
    : t('payment.failureEyebrow') || 'Payment not completed'
  const helpIconClass = isSystemBusy
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
    : 'bg-red-500/10 text-red-600 dark:text-red-300'

  const troubleshootingItems = [
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: t('payment.failureCheckCardTitle') || 'Check your card or gateway',
      description:
        t('payment.failureCheckCardDescription') ||
        'Make sure the bank gateway completed the payment before retrying.',
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: t('payment.failureCartSafeTitle') || 'Your cart is still available',
      description:
        t('payment.failureCartSafeDescription') ||
        'You can review your cart and start the payment again.',
    },
    {
      icon: <LifeBuoy className="h-5 w-5" />,
      title: t('payment.failureSupportTitle') || 'Need help?',
      description:
        t('payment.failureSupportDescription') ||
        'If money was deducted, contact support with the payment details below.',
    },
  ]

  return (
    <PaymentResultShell
      dir={dir}
      tone={isSystemBusy ? 'warning' : 'failure'}
      icon={
        isSystemBusy ? (
          <AlertTriangle className="h-12 w-12" strokeWidth={1.8} />
        ) : (
          <XCircle className="h-12 w-12" strokeWidth={1.8} />
        )
      }
      eyebrow={eyebrow}
      title={title}
      message={message}
      primaryAction={{
        label: t('payment.tryAgain') || 'Try Again',
        onClick: () => navigate('/payment'),
        icon: <CreditCard className="h-5 w-5" />,
      }}
      secondaryAction={{
        label: t('payment.reviewCart') || 'Review cart',
        onClick: () => navigate('/cart'),
        icon: <ShoppingCart className="h-5 w-5" />,
        variant: 'outline',
      }}
      aside={
        <div className="space-y-4">
          <div>
            <p className="text-sm font-f-sbold first-text-color">
              {t('payment.failureHelpTitle') || 'How to continue'}
            </p>
            <p className="mt-1 text-xs leading-6 first-text-color-for-paragraph">
              {t('payment.failureHelpHint') ||
                'Most payment failures are temporary. You can retry safely from here.'}
            </p>
          </div>

          <div className="space-y-3">
            {troubleshootingItems.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl bg-color-for-layer-sec p-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${helpIconClass}`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-f-sbold first-text-color">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 first-text-color-for-paragraph">
                    {item.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      }
    >
      {hasDebugInfo && (
        <div className="text-start">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-f-sbold first-text-color">
              {t('payment.failureDebugTitle') || 'Payment debug details'}
            </p>
            <span className="rounded-full border border-gray-300/50 px-2.5 py-1 text-[11px] font-f-sbold first-text-color-for-paragraph">
              {reason || t('payment.failureUnknownReason') || 'unknown'}
            </span>
          </div>

          <dl className="divide-y divide-gray-300/40 overflow-hidden rounded-2xl border border-gray-300/50">
            {debugRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-1 bg-color-for-layer-sec px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3"
              >
                <dt className="font-mono text-xs first-text-color-for-paragraph-low">
                  {row.label}
                </dt>
                <dd className="break-all font-mono text-xs first-text-color">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 first-text-color-for-paragraph">
            {t('payment.failureDebugHint') ||
              'Share these details with support if the problem continues.'}
          </p>
        </div>
      )}
    </PaymentResultShell>
  )
}
