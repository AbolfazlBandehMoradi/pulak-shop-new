import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShareSocialMedia } from '@/components/reusable-components/ShareSocialMedia/ShareSocialMedia';
import { getCleanUrl } from '@/utils/url';

interface Props {
  url?: string;
  title?: string;
}

export function ShareLinkButton({ url, title = '' }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = getCleanUrl(url || (typeof window !== 'undefined' ? window.location.href : ''));

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileTap={{ scale: 0.95 }}
        aria-label={t('share.open')}
        className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-sm bg-first/5 text-first transition-all duration-200 hover:bg-first/10"
      >
        <Share2 className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('share.title')}
              className="w-full max-w-md rounded-2xl bg-color-for-layer-on-body p-5 shadow-2xl"
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-s-bold first-text-color">{t('share.title')}</h3>
                  <p className="truncate text-xs first-text-color-for-paragraph-low">{shareUrl}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('common.cancel')}
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-first/5 text-first transition hover:bg-first/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ShareSocialMedia
                url={shareUrl}
                title={title}
                options={['telegram', 'instagram', 'whatsapp']}
                className="grid grid-cols-1 gap-2 xs:grid-cols-3"
                buttonClassName="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-first/10 bg-first/5 px-3 py-2 text-sm first-text-color transition hover:bg-first/10"
                iconClassName="text-first"
                textClassName="truncate"
                customItems={{
                  whatsapp: {
                    imageClassName: 'h-7 w-7',
                  },
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
