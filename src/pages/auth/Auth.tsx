import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import logo from '@/assets/Images/Logo/MainLogo.png';
import banner1 from '@/assets/Images/Auth/1.png';
import { sendOtp, verifyOtp } from '@/utils/authApi';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { useAuth } from '@/context/AuthContext';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { OTP_LENGTH } from '@/utils/authConstants';
import OtpStep from './OtpStep';
import OtpStepMobile from './OtpStepMobile';

type AuthErrorContext = 'mobile' | 'sendOtp' | 'verifyOtp';

const RESEND_TIME = 60;
const MOBILE_REGEX = /^09\d{9}$/;
const createEmptyOtp = () => Array.from({ length: OTP_LENGTH }, () => '');

const toEnglishDigits = (value: string) =>
  value
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 1728))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 1584));

export default function Auth() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(createEmptyOtp);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const localizedPath = useLocalizedPath();
  const { isAuthenticated, setAuthSession } = useAuth();

  const redirectUrl =
    (location.state as { redirectUrl?: string })?.redirectUrl || localizedPath('/');

  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const normalizeMobile = (value: string) => {
    const digits = toEnglishDigits(value).replace(/\D/g, '');

    if (digits.startsWith('989')) return `0${digits.slice(2)}`;
    if (digits.startsWith('9') && digits.length === 10) return `0${digits}`;

    return digits;
  };

  const mapAuthErrorMessage = (context: AuthErrorContext, apiError?: unknown) => {
    const rawMessage = apiError instanceof Error ? apiError.message : String(apiError ?? '');
    const normalized = rawMessage.toLowerCase();
    const status =
      typeof apiError === 'object' && apiError !== null
        ? (apiError as { status?: number }).status
        : undefined;

    const fallbackByContext: Record<AuthErrorContext, string> = {
      mobile: t('auth.login.mobileInvalid'),
      sendOtp: t('auth.login.error.sendOtpFailed'),
      verifyOtp: t('auth.login.error.invalidOrExpiredOtp'),
    };

    if (status === 429 || normalized.includes('too many')) {
      return t('auth.login.error.sendOtpFailedLater');
    }

    if (
      normalized.includes('network') ||
      normalized.includes('failed to fetch') ||
      normalized.includes('timeout')
    ) {
      return context === 'verifyOtp'
        ? t('auth.login.error.invalidOrExpiredOtp')
        : t('auth.login.error.sendOtpFailedLater');
    }

    if (
      normalized.includes('invalid otp') ||
      normalized.includes('expired otp') ||
      normalized.includes('invalid or expired otp') ||
      normalized.includes('verification code')
    ) {
      return t('auth.login.error.invalidOrExpiredOtp');
    }

    if (normalized.includes('mobile') || normalized.includes('phone')) {
      return t('auth.login.mobileInvalid');
    }

    return fallbackByContext[context];
  };

  const startResendTimer = () => {
    setResendTimer(RESEND_TIME);

    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }

    resendIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (resendIntervalRef.current) {
            clearInterval(resendIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp(createEmptyOtp());
    setError(null);

    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }

    setResendTimer(0);
  };

  const handleSendOtp = async () => {
    if (sending) return;

    setError(null);

    if (!MOBILE_REGEX.test(mobile)) {
      setError(mapAuthErrorMessage('mobile'));
      return;
    }

    try {
      setSending(true);

      await sendOtp(mobile, lang);

      setOtp(createEmptyOtp());
      setStep('otp');
      startResendTimer();
      setFocusTrigger((prev) => prev + 1);
    } catch (apiError) {
      setError(mapAuthErrorMessage('sendOtp', apiError));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (verifying) return;

    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError(t('auth.login.otpInvalid'));
      return;
    }

    setError(null);

    try {
      setVerifying(true);

      const res = await verifyOtp({
        mobile,
        otpCode: code,
        rememberMe: true,
      });

      setAuthSession(res);
    } catch (apiError) {
      setError(mapAuthErrorMessage('verifyOtp', apiError));
      setOtp(createEmptyOtp());
      setFocusTrigger((prev) => prev + 1);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (step === 'otp' && otp.every(Boolean)) {
      const timeout = setTimeout(handleVerify, 300);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [otp, step]);

  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-5 md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-first/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-secound/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-gray-200/40 bg-color-for-layer-on-body shadow-dark-sm md:grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <Link to={localizedPath('/')} className="inline-flex items-center">
                <img src={logo} className="h-10 w-auto md:h-11" alt="logo" />
              </Link>

              <Link
                to={localizedPath('/')}
                className="group inline-flex items-center gap-1 rounded-xl border border-gray-300/70 px-3 py-2 text-sm font-s-medium first-text-color transition-colors hover:bg-first hover:text-white"
              >
                <span className="leading-none">{lang === 'fa' ? 'بازگشت  ' : 'Back to home'}</span>
                <ChevronLeftIcon className="h-4 w-4 shrink-0 transition-colors group-hover:text-white" />
              </Link>
            </div>

            <div className="mt-6 md:mt-9">
              <h1 className="text-center text-2xl font-s-bold first-text-color md:text-3xl">
                {lang === 'fa' ? (
                  <>
                    به <span className="text-third">پولک شاپ</span> خوش آمدید
                  </>
                ) : (
                  <>
                    Welcome to <span className="text-third">PulakShop</span>
                  </>
                )}{' '}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-center text-sm first-text-color-for-paragraph md:text-base">
                {step === 'mobile'
                  ? t('auth.login.welcome')
                  : lang === 'fa'
                    ? ''
                    : ''}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200/55 bg-color-for-layer-sec p-4 sm:p-5">
              {step === 'mobile' && (
                <OtpStepMobile
                  mobile={mobile}
                  setMobile={setMobile}
                  sending={sending}
                  onSend={handleSendOtp}
                  normalizeMobile={normalizeMobile}
                  mobileError={t('auth.login.mobileInvalid')}
                  label={lang === 'fa' ? 'شماره موبایل' : 'Mobile number'}
                  hint={lang === 'fa' ? 'فرمت صحیح: 09123456789' : 'Expected format: 09123456789'}
                />
              )}

              {step === 'otp' && (
                <OtpStep
                  mobile={mobile}
                  otp={otp}
                  setOtp={setOtp}
                  verifying={verifying}
                  sending={sending}
                  resendTimer={resendTimer}
                  onVerify={handleVerify}
                  onResend={handleSendOtp}
                  onBack={handleBackToMobile}
                  focusTrigger={focusTrigger}
                  incompleteOtpError={t('auth.login.otpInvalid')}
                />
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="relative hidden h-full md:flex">
            <div className="absolute inset-0 bg-linear-to-tr from-first-100 via-first-300/85 to-secound-100" />
            <div className="relative z-10 flex w-full flex-col items-center justify-center p-8 text-center">
              <img
                className="w-4/5 max-w-sm object-contain"
                src={banner1}
                alt="Authentication illustration"
              />
              <div className="mt-6 rounded-2xl bg-white/75 p-4 backdrop-blur-xs">
                <div className="flex items-center justify-center gap-2 first-text-color">
                  <ShieldCheck className="h-5 w-5 text-first" />
                  <span className="font-s-medium">
                    {lang === 'fa'
                      ? 'ورود سریع و امن با کد یکبار مصرف'
                      : 'Fast and secure one-time code login'}
                  </span>
                </div>
                <p className="mt-2 text-sm first-text-color-for-paragraph">
                  {lang === 'fa'
                    ? 'بدون رمز عبور وارد شوید و حساب کاربری خود را ایمن نگه دارید.'
                    : 'Sign in without passwords while keeping your account protected.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
