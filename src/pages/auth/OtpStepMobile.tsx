import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';

type MobileStepProps = {
  mobile: string;
  setMobile: React.Dispatch<React.SetStateAction<string>>;
  sending: boolean;
  onSend: () => void;
  normalizeMobile: (value: string) => string;
};

export default function MobileStep({
  mobile,
  setMobile,
  sending,
  onSend,
  normalizeMobile,
}: MobileStepProps) {
  const { t } = useTranslation();

  return (
    <div>
      <input
        type="tel"
        value={mobile}
        onChange={(e) => {
          const v = normalizeMobile(e.target.value);
          if (v.length <= 11) setMobile(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSend();
          }
        }}
        placeholder="09xxxxxxxxx"
      />

      <Button onClick={onSend} disabled={sending}>
        <MessageSquare />
        {sending ? t('login.sending') : t('login.getCode')}
      </Button>
    </div>
  );
}
