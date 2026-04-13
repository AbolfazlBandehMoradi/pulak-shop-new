import React, { useRef } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

  const handleOtpChange = (i: number, v: string) => {
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

  return (
    <div>
      <button onClick={onBack}>{lang === 'fa' ? 'ویرایش شماره' : 'Edit phone number'}</button>

      <p className="text-sm text-gray-500 text-center">
        {t('login.codeSentTo')} {mobile}
      </p>

      <div className="flex justify-center gap-2" dir="ltr">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (otpRefs.current[i] = el)}
            value={d}
            maxLength={1}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className="w-12 h-12 text-center border rounded-lg text-lg"
          />
        ))}
      </div>

      <Button onClick={onVerify} disabled={verifying} className="w-full bg-first">
        <LogIn className="h-5 w-5 mr-2" />
        {verifying ? t('login.signingIn') : t('login.signIn')}
      </Button>

      <button
        onClick={onResend}
        disabled={sending || resendTimer > 0}
        className={`text-xs block mx-auto ${
          resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-first'
        }`}
      >
        {resendTimer > 0 ? `${t('login.resendOtp')} (${resendTimer}s)` : t('login.resendOtp')}
      </button>
    </div>
  );
}
