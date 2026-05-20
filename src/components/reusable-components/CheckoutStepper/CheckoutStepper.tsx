import { ShoppingBag, ShoppingCart, Package } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { useParams } from 'react-router-dom';

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  {
    id: 1,
    key: 'cart',
    fallback: 'Cart',
    icon: ShoppingCart,
  },
  {
    id: 2,
    key: 'checkout',
    fallback: 'Checkout',
    icon: ShoppingBag,
  },
  {
    id: 3,
    key: 'payment',
    fallback: 'Payment',
    icon: Package,
  },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const { langCode: routeLangCode } = useParams<{ langCode: string }>();
  const currentLanguage = useLangStore((s) => s.lang);
  const { t } = useTranslation();
  const effectiveLangCode = routeLangCode || currentLanguage || 'fa';

  return (
    <div className="mt-8 mb-8">
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.25);
            opacity: 0;
          }
          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }
        .pulse-ring::before {
          animation: pulse-ring 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="flex items-center justify-center  ">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                {isActive ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-md before:content-[''] before:absolute before:inset-1 before:rounded-md before:border before:border-first before:animate-ping" />
                    <div className="relative w-8 h-8 rounded-md  bg-first  flex items-center justify-center ">
                      <Icon strokeWidth={1} className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-md flex   items-center justify-center 
                      ${isCompleted ? 'bg-first opacity-100' : 'bg-color-for-layer-on-body opacity-50'}
                    `}
                  >
                    <Icon
                      strokeWidth={1}
                      className={`h-4 w-4 ${isCompleted ? 'text-white' : 'text-gray-500 dark:text-gray-400'}
                      `}
                    />
                  </div>
                )}
                <span
                  className={`text-xs md:text-sm transition-colors
                      ${
                        isActive
                          ? 'font-f-sbold text-secound dark:text-secound-400'
                          : isCompleted
                            ? 'font-f-sbold text-secound dark:text-secound-400'
                            : 'font-light first-text-color-for-paragraph opacity-50'
                      }
                    `}
                >
                  {step.key === 'cart'
                    ? t('cart.cart.yourShoppingCart') || step.fallback
                    : step.key === 'checkout'
                      ? t('cart.checkout.address') || step.fallback
                      : step.key === 'payment'
                        ? t('cart.payment.title') || step.fallback
                        : effectiveLangCode === 'fa'}
                </span>
              </div>

              {/* Connector */}
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors
                    ${currentStep > step.id ? 'bg-first' : 'bg-gray-300 dark:bg-gray-700'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
