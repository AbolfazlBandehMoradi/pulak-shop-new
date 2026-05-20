import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: string;
  initialLiked?: boolean;
  onToggle?: (liked: boolean, productId: string) => Promise<void> | void;
}

export function AddToWishlistButton({ productId, initialLiked = false, onToggle }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [pulse, setPulse] = useState(false);
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleClick = async () => {
    if (loading) return;

    const nextState = !liked;

    try {
      setLoading(true);

      setLiked(nextState);

      setPulse(true);
      setTimeout(() => setPulse(false), 300);

      await onToggle?.(nextState, productId);

      success(nextState ? t('share.toast.added') : t('share.toast.removed'));
    } catch (err) {
      console.error(err);

      setLiked(!nextState);

      error(t('share.toast.error'));
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
        transition-all duration-200 overflow-hidden
        ${liked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}
        ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Heart Icon */}
      <motion.div
        animate={
          pulse
            ? {
                scale: [1, 1.35, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-white' : ''}`} />
      </motion.div>
      {loading && <span className="absolute text-[11px] opacity-70">{t('wishlist.loading')}</span>}
    </motion.button>
  );
}
