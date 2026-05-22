import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from '@/components/ui/Button'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'
import { useAuth } from '@/context/AuthContext'
import useCartStore from '@/stores/cartStore'
import { getCart } from '@/utils/cartApi'

export default function PaymentSuccessPage() {
  const navigate = useLocalizedNavigate()
  const { t } = useTranslation()
  const dir = useLangStore((s) => s.dir)
  const currentLanguage = useLangStore((s) => s.lang)
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const setCart = useCartStore((state) => state.setCart)
  const effectiveLangCode = currentLanguage || 'fa'

  useEffect(() => {
    if (!isAuthenticated) return

    const cartScope = `user:${user?.id ?? 'authenticated'}`
    let isMounted = true

    const syncCartAfterPayment = async () => {
      try {
        const latestCart = await queryClient.fetchQuery({
          queryKey: ['cart', effectiveLangCode, cartScope],
          queryFn: () => getCart(effectiveLangCode),
        })

        if (!isMounted) return
        setCart(latestCart)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[PaymentSuccessPage] failed to refresh cart', error)
        }
      }
    }

    void syncCartAfterPayment()

    return () => {
      isMounted = false
    }
  }, [effectiveLangCode, isAuthenticated, queryClient, setCart, user?.id])

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
