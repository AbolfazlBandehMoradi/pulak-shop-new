import { XCircle } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from '@/components/ui/Button'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'

export default function PaymentFailurePage() {
  const navigate = useLocalizedNavigate()
  const { t } = useTranslation()
  const dir = useLangStore((s) => s.dir)

  return (
    <div dir={dir} className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {t('payment.failureTitle') || 'Payment Failed'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t('payment.failureMessage') || 'Your payment could not be completed. Please try again.'}
        </p>
        <Button variant="outline" onClick={() => navigate(`/payment`)}>
          {t('payment.tryAgain') || 'Try Again'}
        </Button>
      </div>
    </div>
  )
}
