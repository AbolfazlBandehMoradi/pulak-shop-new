import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';
import { useState } from 'react';
import { z, ZodError } from 'zod';

type MobileStepProps = {
  mobile: string;
  setMobile: React.Dispatch<React.SetStateAction<string>>;
  sending: boolean;
  onSend: () => void;
  normalizeMobile: (value: string) => string;
};

const mobileSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید 11 رقم و با 09 شروع شود');


export default function MobileStep({
  mobile,
  setMobile,
  sending,
  onSend,
  normalizeMobile,
}: MobileStepProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

const handleSend = () => {
  const result = mobileSchema.safeParse(mobile);

  if (!result.success) {
    if (result.error instanceof ZodError) {
      setError(result.error.issues[0]?.message);
    }
    return;
  }
  setError(null);
  onSend();
};

  return (
    <div className="flex flex-wrap">

      <div className="flex justify-center flex-row-reverse gap-3 w-full">
        <input
          className="rounded-md placeholder:opacity-50 placeholder:text-xs mt-4 p-4 w-full outline-none text-[14px] first-text-color border border-gray-400"
          type="tel"
          value={mobile}
          onChange={(e) => {
            const v = normalizeMobile(e.target.value);
            if (v.length <= 11) {
              setMobile(v);
              if (error) setError(null); // UX بهتر
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={t('auth.login.enterMobile')}
        />
      </div>

      {/* error */}
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">
          {error}
        </p>
      )}

      <div className="w-full">
        <Button
          className="py-4 w-full cursor-pointer disabled:bg-gray-400 mt-4 px-2 bg-first text-white rounded-md"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? t('auth.login.sending') : t('auth.login.getCode')}
        </Button>
      </div>

    </div>
  );
}