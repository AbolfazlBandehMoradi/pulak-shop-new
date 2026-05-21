import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';

type MobileStepProps = {
  mobile: string;
  setMobile: React.Dispatch<React.SetStateAction<string>>;
  sending: boolean;
  onSend: () => void;
  normalizeMobile: (value: string) => string;
  mobileError: string;
  label: string;
  hint: string;
};

const MOBILE_REGEX = /^09\d{9}$/;

export default function MobileStep({
  mobile,
  setMobile,
  sending,
  onSend,
  normalizeMobile,
  mobileError,
  label,
  hint,
}: MobileStepProps) {
  const { t } = useTranslation();
  const [shouldShowError, setShouldShowError] = useState(false);

  const hasError = shouldShowError && !MOBILE_REGEX.test(mobile);

  const handleSend = () => {
    setShouldShowError(true);

    if (!MOBILE_REGEX.test(mobile)) {
      return;
    }

    onSend();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-s-medium first-text-color">{label}</label>
        <div className="flex items-center rounded-xl border border-gray-300 bg-color-for-layer-on-body px-3 transition-all focus-within:border-first focus-within:ring-2 focus-within:ring-first/20">
          <input
            className="h-13 w-full bg-transparent px-1 text-[15px] first-text-color outline-none placeholder:text-sm placeholder:text-gray-400"
            type="tel"
            value={mobile}
            onChange={(e) => {
              const v = normalizeMobile(e.target.value);
              if (v.length <= 11) {
                setMobile(v);

                if (v.length < 11 && shouldShowError) {
                  setShouldShowError(false);
                }

                if (v.length === 11) {
                  setShouldShowError(true);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={t('auth.login.enterMobile')}
            inputMode="numeric"
            autoComplete="tel"
            aria-invalid={hasError}
          />
        </div>
        <p className="mt-2 text-xs first-text-color-for-paragraph">{hint}</p>
      </div>

      {hasError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{mobileError}</p>}

      <Button
        className="h-12 w-full rounded-xl bg-first text-white disabled:bg-gray-400"
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? t('auth.login.sending') : t('auth.login.getCode')}
      </Button>
    </div>
  );
}
