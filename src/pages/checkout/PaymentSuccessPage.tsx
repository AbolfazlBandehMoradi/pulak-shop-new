import { useEffect } from 'react'
import { CheckCircle2, Home, PackageCheck, ReceiptText, ShieldCheck } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '@/i18n/useTranslation'
import { useLangStore } from '@/stores/languageStore'
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate'
import { useAuth } from '@/context/AuthContext'
import useCartStore from '@/stores/cartStore'
import { getCart } from '@/utils/cartApi'
import { PaymentResultShell } from './sections/PaymentResultShell'

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

  const nextSteps = [
    {
      icon: <ReceiptText className="h-5 w-5" />,
      title: t('payment.successReceiptTitle') || 'Payment recorded',
      description:
        t('payment.successReceiptDescription') ||
        'Your order receipt and payment status are saved in your profile.',
    },
    {
      icon: <PackageCheck className="h-5 w-5" />,
      title: t('payment.successPreparationTitle') || 'Order is being prepared',
      description:
        t('payment.successPreparationDescription') ||
        'We will start processing your purchase and update your order history.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: t('payment.successSecureTitle') || 'Secure transaction',
      description:
        t('payment.successSecureDescription') ||
        'Your payment confirmation has been received through the gateway.',
    },
  ]

  return (
    <PaymentResultShell
      dir={dir}
      tone="success"
      icon={<CheckCircle2 className="h-12 w-12" strokeWidth={1.8} />}
      eyebrow={t('payment.successEyebrow') || 'Payment confirmed'}
      title={t('payment.successTitle') || 'Payment Successful'}
      message={t('payment.successMessage') || 'Your payment was completed successfully.'}
      primaryAction={{
        label: t('payment.viewOrders') || 'View orders',
        onClick: () => navigate('/profile'),
        icon: <ReceiptText className="h-5 w-5" />,
      }}
      secondaryAction={{
        label: t('payment.backToHome') || 'Back to Home',
        onClick: () => navigate('/'),
        icon: <Home className="h-5 w-5" />,
        variant: 'outline',
      }}
      aside={
        <div className="space-y-4">
          <div>
            <p className="text-sm font-f-sbold first-text-color">
              {t('payment.whatHappensNext') || 'What happens next'}
            </p>
            <p className="mt-1 text-xs leading-6 first-text-color-for-paragraph">
              {t('payment.successNextHint') ||
                'You can follow the latest status from your profile whenever you need it.'}
            </p>
          </div>

          <div className="space-y-3">
            {nextSteps.map((step) => (
              <div key={step.title} className="flex gap-3 rounded-2xl bg-color-for-layer-sec p-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  {step.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-f-sbold first-text-color">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 first-text-color-for-paragraph">
                    {step.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
