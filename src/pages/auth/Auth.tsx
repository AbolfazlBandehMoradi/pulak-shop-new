import { useEffect, useRef, useState } from 'react';
import { MessageSquare, LogIn, AlertCircle } from 'lucide-react';
import logo from '@/assets/Images/Logo/MainLogo.png';
import { sendOtp, verifyOtp } from '@/utils/authApi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { useAuth } from '@/context/AuthContext';
import banner1 from '@/assets/images/auth/2.png';
import banner2 from '@/assets/images/auth/1.png';
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
      setError(e?.message || t('login.error.invalidOtp'));

      setOtp(['', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  /* ---------------- otp input logic ---------------- */

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

  /* ---------------- auto verify ---------------- */

  useEffect(() => {
    if (step === 'otp' && otp.every(Boolean)) {
      const timeout = setTimeout(handleVerify, 300);
      return () => clearTimeout(timeout);
    }
  }, [otp, step]);

  return (
    <section className="h-screen flex justify-center items-center mx-auto sm:container">
      <div className=" md:w-70/96 h-full md:h-[60vh] bg-color-for-layer-on-body rounded-xl w-full overflow-hidden flex-wrap">
        <div className="flex flex-wrap h-full overflow-hidden">
          <div className="w-48/96 p-4">
            <div className="flex items-center justify-between">
              <Link to={localizedPath('/')}>
                <img src={logo} alt="logo" />
              </Link>
              <Link
                to={localizedPath('/')}
                className="group inline-flex items-center hover:bg-secound hover:text-white border px-2 py-2 rounded-lg gap-1 text-sm font-s-medium text-secound transition-colors"
              >
                <span className="flex items-center mb-0.5 leading-none">
                  {lang === 'fa' ? 'صفحه اصلی' : 'Index'}
                </span>

                <ChevronLeftIcon className="h-4 w-4 shrink-0 transition-colors group-hover:text-white" />
              </Link>
            </div>
            <div className="">
              <h1 className="">{lang === 'fa' ? 'گاما طب' : 'Gamma Teb'}</h1>
              <p>{step === 'mobile' ? t('login.welcome') : ''}</p>
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
                <div className="mt-4 flex gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
          <div className="w-48/96 h-full flex ">
            <div
              className="bg-linear-to-tr flex justify-center items-center w-full h-full
            from-third-100 from-0% via-third-300/50 via-50% to-third-100 to-100%"
            >
              <img className="" src={banner1} alt="banner" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
