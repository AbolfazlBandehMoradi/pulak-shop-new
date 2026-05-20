import { GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: string;
  initialCompared?: boolean;
  onToggle?: (active: boolean, productId: string) => Promise<void> | void;
}

export function CompareButton({ productId, initialCompared = false, onToggle }: Props) {
  const [active, setActive] = useState(initialCompared);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    setActive(initialCompared);
  }, [initialCompared]);

  const handleClick = async () => {
    if (loading) return;
    const nextState = !active;
    try {
      setLoading(true);
      setActive(nextState);
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
      await onToggle?.(nextState, productId);
      success(nextState ? t('share.toast.addedCompare') : t('share.toast.removedCompare'));
    } catch (err) {
      console.error(err);
      setActive(!nextState);
      error(t('share.toast.errorCompare'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex items-center justify-center
        w-full h-10 rounded-sm
        transition-all duration-200
        overflow-hidden
        ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}
        ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        animate={pulse ? { rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <GitCompare className="w-4 h-4" />
      </motion.div>

      {loading && <span className="absolute text-[11px] opacity-70">{t('compare.loading')}</span>}
    </motion.button>
  );
}
