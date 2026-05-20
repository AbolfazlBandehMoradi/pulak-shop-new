import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLangStore } from '@/stores/languageStore';
import { useTranslation } from '@/i18n/useTranslation';
import { OTP_LENGTH } from '@/utils/authConstants';

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
  focusTrigger: number;
  incompleteOtpError: string;
};

const toEnglishDigits = (value: string) =>
  value
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1728))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1584));

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
  focusTrigger,
  incompleteOtpError,
}: OtpStepProps) {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, [focusTrigger]);

  const applyOtpCode = (startIndex: number, rawValue: string) => {
    const digits = toEnglishDigits(rawValue).replace(/\D/g, '');
    if (!digits) return;

    const next = [...otp];
    const maxDigits = OTP_LENGTH - startIndex;
    digits
      .slice(0, maxDigits)
      .split('')
      .forEach((digit, offset) => {
        next[startIndex + offset] = digit;
      });

    setOtp(next);

    const lastIndex = Math.min(startIndex + digits.length, OTP_LENGTH) - 1;
    if (lastIndex >= 0) {
      otpRefs.current[lastIndex]?.focus();
    }
  };

  useEffect(() => {
    if (verifying) {
      return;
    }

    if (typeof window === 'undefined' || !('OTPCredential' in window) || !navigator.credentials) {
      return;
    }

    const abortController = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      } as CredentialRequestOptions)
      .then((otpCredential) => {
        const receivedCode =
          typeof otpCredential === 'object' &&
          otpCredential !== null &&
          'code' in otpCredential &&
          typeof otpCredential.code === 'string'
            ? otpCredential.code
            : '';

        if (!receivedCode) {
          return;
        }

        applyOtpCode(0, receivedCode);
      })
      .catch(() => {
        // Silently ignore abort/unsupported/runtime errors for non-WebOTP browsers.
      });

    return () => {
      abortController.abort();
    };
  }, [verifying]);

  const handleOtpChange = (index: number, nextValue: string) => {
    if (otpError) setOtpError(null);

    const digits = toEnglishDigits(nextValue).replace(/\D/g, '');
    if (!digits) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    if (digits.length > 1) {
      applyOtpCode(index, digits);
      return;
    }

    const next = [...otp];
    next[index] = digits;
    setOtp(next);

    if (digits && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;

    if (otp[index]) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    if (index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = toEnglishDigits(event.clipboardData.getData('text'))
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    applyOtpCode(0, pasted);
  };

  const handleVerify = async () => {
    if (verifying) return;

    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setOtpError(incompleteOtpError);
      return;
    }

    setOtpError(null);
    await onVerify();
  };

  const counterText =
    resendTimer > 0
      ? `${t('auth.register.resendOtp')} (${resendTimer} ${t('auth.register.seconds')})`
      : t('auth.register.resendOtp');

  return (
    <div className="space-y-5">
      <button
        className="inline-flex items-center gap-1 text-sm text-first transition-colors hover:text-first-700"
        onClick={onBack}
      >
        {lang === 'fa' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        <span>{lang === 'fa' ? 'ویرایش شماره موبایل' : 'Edit mobile number'}</span>
      </button>

      <div className="rounded-xl border border-first/20 bg-first/5 p-3 text-sm first-text-color-for-paragraph">
        <span>{t('auth.register.otpSentToThisMobile')} </span>
        <span className="font-s-medium text-first">{mobile}</span>
        <span> {t('auth.register.otpSentToThisMobileP2')}</span>
      </div>

      <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            value={digit}
            maxLength={1}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-13 w-12 rounded-xl border border-gray-300 bg-color-for-layer-on-body text-center text-xl font-semibold first-text-color outline-none transition-all focus:border-first focus:ring-2 focus:ring-first/20 sm:w-14"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {otpError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{otpError}</p>}

      <Button
        onClick={handleVerify}
        disabled={verifying}
        className="h-12 w-full rounded-xl bg-first text-white disabled:bg-gray-400"
      >
        {verifying ? t('auth.login.signingIn') : t('auth.login.signIn')}
      </Button>

      <button
        onClick={onResend}
        disabled={sending || resendTimer > 0}
        className={`text-xs transition ${
          resendTimer > 0
            ? 'cursor-not-allowed text-gray-400'
            : 'font-s-medium text-first hover:text-first-700'
        }`}
      >
        {counterText}
      </button>
    </div>
  );
}
