import { Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { copyToClipboard, getCleanUrl } from '@/utils/url';
import { useTranslation } from 'react-i18next';
interface Props {
  url?: string;
}

export function CopyLinkButton({ url }: Props) {
  const { success, error } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setLoading(true);
      const cleanUrl = getCleanUrl(url || window.location.href);
      const ok = await copyToClipboard(cleanUrl);
      if (!ok) {
        error(t('share.toast.copyError'));
        return;
      }
      success(t('share.toast.copySuccess'));
      setCopied(true);
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
      error(t('share.toast.copyError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex w-full  justify-center items-center h-10
        rounded-sm text-sm transition-all duration-200
        ${copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}
        ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div animate={pulse ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
        <Link2 className="h-4 w-4" />
      </motion.div>
      {loading && <span className="absolute text-xs opacity-60">در حال کپی...</span>}
    </motion.button>
  );
}
