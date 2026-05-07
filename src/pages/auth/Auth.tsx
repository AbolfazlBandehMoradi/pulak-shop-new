import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import logo from '@/assets/Images/Logo/MainLogo.png';
import { sendOtp, verifyOtp } from '@/utils/authApi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { useAuth } from '@/context/AuthContext';
import banner1 from '@/assets/images/auth/1.png';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import OtpStep from './OtpStep';
import OtpStepMobile from './OtpStepMobile';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
export default function Auth() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');

  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const localizedPath = useLocalizedPath();
  const { isAuthenticated } = useAuth();

  const redirectUrl =
    (location.state as { redirectUrl?: string })?.redirectUrl || localizedPath('/');

  const RESEND_TIME = 60;

  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------------- cleanup ---------------- */

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
    };
  }, []);

  /* ---------------- redirect if logged in ---------------- */

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, redirectUrl, navigate]);

  /* ---------------- helpers ---------------- */

  const normalizeMobile = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('989')) return '0' + digits.slice(2);
    if (digits.startsWith('9') && digits.length === 10) return '0' + digits;

    return digits;
  };

  const startResendTimer = () => {
    setResendTimer(RESEND_TIME);

    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }

    resendIntervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ---------------- navigation ---------------- */

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp(['', '', '', '', '']);
    setError(null);

    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }

    setResendTimer(0);
  };

  /* ---------------- send otp ---------------- */

  const handleSendOtp = async () => {
    setError(null);

    if (mobile.length !== 11 || sending) {
      setError(t('login.mobileInvalid') || 'Invalid mobile number');
      return;
    }

    try {
      setSending(true);

      await sendOtp(mobile, lang);

      setStep('otp');

      startResendTimer();

      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      setError(e?.message || t('login.error.sendOtpFailed'));
    } finally {
      setSending(false);
    }
  };
  // const handleSendOtp = async () => {
  //   setError(null);

  //   if (mobile.length !== 11 || sending) {
  //     setError(t('auth.login.mobileInvalid'));
  //     return;
  //   }

  //   try {
  //     setSending(true);

  //     // ❌ اینو کامنت کن
  //     // await sendOtp(mobile, lang);

  //     // ✅ فیک
  //     await new Promise((res) => setTimeout(res, 800));

  //     setStep('otp');
  //     startResendTimer();

  //   } catch (e: any) {
  //     setError(e?.message);
  //   } finally {
  //     setSending(false);
  //   }
  // };
  /* ---------------- verify otp ---------------- */

  const handleVerify = async () => {
    if (verifying) return;

    const code = otp.join('');

    if (code.length !== 5) return;

    setError(null);

    try {
      setVerifying(true);

      const res = await verifyOtp({
        mobile,
        otpCode: code,
        rememberMe: true,
      });

      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('refresh_token', res.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(res.user));

      window.dispatchEvent(
        new CustomEvent('auth-token-refreshed', {
          detail: { token: res.token, user: res.user },
        }),
      );
    } catch (e: any) {
      setError(e?.message || t('auth.login.error.invalidOtp'));

      setOtp(['', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };
  useEffect(() => {
    if (step === 'otp' && otp.every(Boolean)) {
      const timeout = setTimeout(handleVerify, 300);
      return () => clearTimeout(timeout);
    }
  }, [otp, step]);
  return (
    <section className=" h-dvh md:h-screen flex justify-center items-center mx-auto md:container">
      <div className=" md:w-88/96 lg:w-70/96 h-full md:h-[60vh] bg-color-for-layer-on-body rounded-xl w-full overflow-hidden flex-wrap">
        <div
          className={`flex flex-wrap h-full overflow-hidden ${
            lang === 'fa' ? ' ' : 'flex flex-row-reverse'
          }`}
        >
          <div
            className=" w-full h-full flex flex-col justify-center md:justify-start  md:w-48/96 p-4
          "
          >
              <div className="flex items-center justify-between">
                <Link to={localizedPath('/')}>
                  <img src={logo} className="w-3/4" alt="logo" />
                </Link>
                <Link
                  to={localizedPath('/')}
                  className="group inline-flex items-center hover:bg-first hover:text-white border px-2 py-2 rounded-lg gap-1 text-sm font-s-medium text-first transition-colors"
                >
                  <span className="flex items-center mb-0.5 leading-none">
                    {lang === 'fa' ? 'صفحه اصلی' : 'Index'}
                  </span>
                  <ChevronLeftIcon className="h-4 w-4 shrink-0 transition-colors group-hover:text-white" />
                </Link>
              </div>
              {step === 'mobile' && (
                <h1
                  className={`font-s-bold md:mt-5 flex-wrap flex flex-col justify-center text-nowrap gap-1 text-center text-lg 2xl:text-2xl ${
                    lang === 'fa' ? ' ' : 'flex flex-row-reverse'
                  }`}
                >
                  <span className="gap-1 flex w-full justify-center text-third">
                    <span className="first-text-color">{lang === 'fa' ? 'به' : 'To'}</span>
                    <span>{t('hero.shopName')}</span>
                    <span className=" flex">{t('hero.shopNameTwo')}</span>
                  </span>
                  <span className="first-text-color w-full justify-center flex">
                    {t('about.welcomeTo')}
                  </span>
                </h1>
              )}
            <div className='mt-3' >
              <p className="text-center mt-4 first-text-color-for-paragraph font-f-light ">
                {step === 'mobile' ? t('auth.login.welcome') : ''}
              </p>
              {step === 'mobile' && (
                <OtpStepMobile
                  mobile={mobile}
                  setMobile={setMobile}
                  sending={sending}
                  onSend={handleSendOtp}
                  normalizeMobile={normalizeMobile}
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
                />
              )}
              {error && (
                <div className="text-sm flex font-f-light items-center mt-4 gap-2 first-text-color-red justify-center">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
          <div className=" hidden w-48/96 h-full md:flex ">
            <div
              className="bg-linear-to-tr flex justify-center items-center w-full h-full
            from-first-100 from-0% via-first-300 via-700% to-first-100 to-100%"
            >
              <img className="w-4/6 object-cover" src={banner1} alt="banner" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
