import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { t } from 'i18next';

type ResultTone = 'success' | 'failure' | 'warning';

type ResultAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'custom' | 'secondary';
  className?: string;
};

type PaymentResultShellProps = {
  dir: string;
  tone: ResultTone;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  message: string;
  primaryAction: ResultAction;
  children?: ReactNode;
  aside?: ReactNode;
};

const toneStyles: Record<
  ResultTone,
  {
    halo: string;
    iconWrap: string;
    iconRing: string;
    eyebrow: string;
    accent: string;
    primaryButton: string;
  }
> = {
  success: {
    halo: 'from-emerald-500/18 via-first/10 to-transparent',
    iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    iconRing: 'border-emerald-200/80 bg-emerald-500/10 dark:border-emerald-500/30',
    eyebrow:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/25 dark:text-emerald-200',
    accent: 'bg-emerald-500',
    primaryButton:
      'bg-emerald-600 text-white  w-full hover:bg-emerald-700 focus:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600',
  },
  failure: {
    halo: 'from-red-500/16 via-secound/10 to-transparent',
    iconWrap: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
    iconRing: 'border-red-200/80 bg-red-500/10 dark:border-red-500/30',
    eyebrow:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-900/25 dark:text-red-200',
    accent: 'bg-red-500',
    primaryButton:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
  },
  warning: {
    halo: 'from-amber-500/18 via-secound/10 to-transparent',
    iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    iconRing: 'border-amber-200/80 bg-amber-500/10 dark:border-amber-500/30',
    eyebrow:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/25 dark:text-amber-200',
    accent: 'bg-amber-500',
    primaryButton:
      'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600',
  },
};

function ActionButton({ action, isPrimary }: { action: ResultAction; isPrimary?: boolean }) {
  return (
    <Button
      variant={action.variant ?? (isPrimary ? 'primary' : 'outline')}
      size="lg"
      onClick={action.onClick}
      className={cn(
        'w-full gap-2 rounded-xl rounded-t-none text-base font-f-sbold ',
        action.className,
      )}
    >
      {action.icon}
      {action.label}
    </Button>
  );
}

export function PaymentResultShell({
  dir,
  tone,
  icon,
  eyebrow,
  title,
  message,
  primaryAction,
  children,
  aside,
}: PaymentResultShellProps) {
  const styles = toneStyles[tone];

  return (
    <main
      dir={dir}
      className="relative isolate flex min-h-[calc(100vh)] items-center overflow-hidden "
    >
      <div className="mx-auto grid w-full max-w-5xl gap-5 ">
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-first-100/80 bg-color-for-layer-on-body p-6 shadow-dark-sm sm:p-8"
        >
          <span className={cn('absolute inset-x-0 top-0 h-1', styles.accent)} />

          <div className="flex flex-col items-center text-center sm:items-start sm:text-start">
            <div className="flex justify-between items-center flex-wrap w-full ">
              <div className="flex  items-center w-full lg:w-80/96 gap-2">
                <div className={cn('mb-6 rounded-full border p-2', styles.iconRing)}>
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-full',
                      styles.iconWrap,
                    )}
                  >
                    {icon}
                  </div>
                </div>
                <div className="flex flex-col ">
                  <span
                    className={cn(
                      ' mb-2 inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-f-sbold',
                      styles.eyebrow,
                    )}
                  >
                    {message}
                  </span>
                  <p className=" max-w-2xl text-sm leading-7 first-text-color-for-paragraph sm:text-base">
                    {t('payment.tnxSuccessMessage') || 'How to continue'}
                  </p>
                </div>
              </div>
              <button className="text-nowrap w-full first-text-color-red mb-4 lg:mb-0 lg:w-16/96">
                {t('payment.backToHome') || 'How to continue'}
              </button>
            </div>
          </div>

          {children && <div className="mt-8 border-t border-gray-300/40 pt-6">{children}</div>}
          {aside && (
            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
              className="rounded-3xl border rounded-b-none border-first-100/80 bg-color-for-layer-on-body p-5 shadow-dark-sm"
            >
              {aside}
            </motion.aside>
          )}
          <div className=" flex w-full  ">
            <ActionButton
              action={{
                ...primaryAction,
                className: cn('w-full', styles.primaryButton, primaryAction.className),
              }}
              isPrimary
            />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
