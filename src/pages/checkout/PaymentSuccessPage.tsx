import { CheckCircle } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from '@/components/ui/Button'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'

export default function PaymentSuccessPage() {
  const navigate = useLocalizedNavigate()
  const { t } = useTranslation()
  const dir = useLangStore((s) => s.dir)

  return (
    <div dir={dir} className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {t('payment.successTitle') || 'Payment Successful'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t('payment.successMessage') || 'Your payment was completed successfully.'}
        </p>
        <Button onClick={() => navigate(`/`)}>
          {t('payment.backToHome') || 'Back to Home'}
        </Button>
      </div>
    </div>
  )
}
