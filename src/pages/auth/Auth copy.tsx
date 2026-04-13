import { useEffect, useRef, useState } from 'react';
import { MessageSquare, LogIn, AlertCircle } from 'lucide-react';
import logo from '@/assets/Images/Logo/MainLogo.png';
import { sendOtp, verifyOtp } from '@/utils/authApi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useLangStore } from '@/stores/languageStore';
import { useAuth } from '@/context/AuthContext';
import banner1 from '@/assets/images/auth/1.png';

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
  const { isAuthenticated } = useAuth();

  const redirectUrl = (location.state as { redirectUrl?: string })?.redirectUrl || '/';

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
    <section className=" h-dvh">
      <div className="">
        <div className="">
          <div className="flex flex-wrap flex-col p-8 bg-color-for-layer-sec lg:w-20/48 rounded-xl w-full order-2 md:order-1">
            <div className="h-1/4">
              <div className="flex items-center">
                <Link to="/" className="w-6/12">
                  <img src={logo} className="h-12" alt="logo" />
                </Link>
                <div className="w-6/12 text-nowrap text-sm text-first text-end">
                  <Link to="/">بازگشت به صفحه اصلی</Link>
                </div>
              </div>
            </div>
            <div className="h-3/4 flex flex-wrap justify-center">
              <div className="w-full">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {lang === 'fa' ? 'گاما طب' : 'Gamma Teb'}
                </h2>
                <p>{step === 'mobile' ? t('login.welcome') : ''}</p>
                {step === 'mobile' && (
                  <div className="space-y-4">
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        const v = normalizeMobile(e.target.value);
                        if (v.length <= 11) setMobile(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendOtp();
                        }
                      }}
                      placeholder="09xxxxxxxxx"
                      className="w-full py-3 px-4 border rounded-lg"
                    />

                    <Button onClick={handleSendOtp} disabled={sending} className="w-full bg-first">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {sending ? t('login.sending') : t('login.getCode')}
                    </Button>
                  </div>
                )}
                {step === 'otp' && (
                  <div className="space-y-4">
                    <button onClick={handleBackToMobile} className="text-sm text-first">
                      {lang === 'fa' ? 'ویرایش شماره' : 'Edit phone number'}
                    </button>

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

                    <Button onClick={handleVerify} disabled={verifying} className="w-full bg-first">
                      <LogIn className="h-5 w-5 mr-2" />
                      {verifying ? t('login.signingIn') : t('login.signIn')}
                    </Button>

                    <button
                      onClick={handleSendOtp}
                      disabled={sending || resendTimer > 0}
                      className={`text-xs block mx-auto ${
                        resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-first'
                      }`}
                    >
                      {resendTimer > 0
                        ? `${t('login.resendOtp')} (${resendTimer}s)`
                        : t('login.resendOtp')}
                    </button>
                  </div>
                )}
                {error && (
                  <div className="mt-4 flex gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:w-27/48 w-full order-1 md:order-2 rounded-3xl relative overflow-hidden">
            <div className="w-full h-96 lg:h-full relative">
              <img
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={banner1}
                alt="banner"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
