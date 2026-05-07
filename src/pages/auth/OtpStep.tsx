import React, { useRef, useState } from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLangStore } from '@/stores/languageStore';
import { useTranslation } from '@/i18n/useTranslation';

type OtpStepProps = {
  mobile: string;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  verifying: boolean;
  sending: boolean;
  resendTimer: number;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
};

export default function OtpStep({
  mobile,
  otp,
  setOtp,
  verifying,
  sending,
  resendTimer,
  onVerify,
  onResend,
  onBack,
}: OtpStepProps) {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);

  const [otpError, setOtpError] = useState<string | null>(null);

  const handleOtpChange = (i: number, v: string) => {
    if (otpError) setOtpError(null);

    if (v && !/^\d$/.test(v)) return;

    const next = [...otp];
    next[i] = v;
    setOtp(next);

    if (v && i < 4) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;

    if (otp[i]) {
      const next = [...otp];
      next[i] = '';
      setOtp(next);
      return;
    }

    if (i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (verifying) return;

    const code = otp.join('');

    if (code.length !== 5) {
      setOtpError(t('auth.register.error.invalidOrExpiredOtp') || 'کد ناقص است');
      return;
    }

    setOtpError(null);

    try {
      await onVerify();
    } catch (e: any) {
      setOtpError(t('auth.register.error.invalidOtp') || 'کد اشتباه است');
    }
  };

  return (
    <div className="flex flex-col mt-24">

      {/* back button */}
      <button
        className="flex first-text-color-red justify-center"
        onClick={onBack}
      >
        {lang === 'fa' ? 'ویرایش شماره' : 'Edit phone number'}
        <ChevronLeftIcon className="h-5 w-5 shrink-0 transition-colors" />
      </button>

      {/* info text */}
      <div
        className={`md:my-2 flex-wrap text-sm first-text-color-for-paragraph flex justify-center text-nowrap gap-1 text-center ${lang === 'fa' ? '' : 'flex-row-reverse'
          }`}
      >
        <span>{t('auth.register.otpSentToThisMobile')}</span>
        <span className="text-third">{mobile}</span>
        <span>{t('auth.register.otpSentToThisMobileP2')}</span>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-3" dir="ltr">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (otpRefs.current[i] = el)}
            value={d}
            maxLength={1}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className="
              w-12 h-14 text-center text-xl font-semibold
              border border-gray-300 rounded-xl
              focus:border-first focus:ring-2 focus:ring-first/30
              outline-none transition
            "
          />
        ))}
      </div>

      {/* verify button */}
      <Button
        onClick={handleVerify}
        disabled={verifying}
        className="py-4 w-full cursor-pointer disabled:bg-gray-400 my-4 bg-first text-white rounded-md"
      >
        {verifying ? t('auth.login.signingIn') : t('auth.login.signIn')}
      </Button>

      {/* error */}
      {otpError && (
        <p className="text-red-500 text-xs text-center mt-2 animate-pulse">
          {otpError}
        </p>
      )}
      <button
        onClick={onResend}
        disabled={sending || resendTimer > 0}
        className={`text-xs block mx-auto transition ${resendTimer > 0
          ? 'text-gray-400 cursor-not-allowed pointer-events-none'
          : 'text-first hover:underline'
          }`}
      >
        {resendTimer > 0
          ? `${t('auth.register.resendOtp')} (${resendTimer}${t('auth.register.seconds')})`
          : t('auth.register.resendOtp')}
      </button>
    </div>
  );
}