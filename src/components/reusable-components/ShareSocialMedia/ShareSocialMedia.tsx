import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link2, MessageCircle, Send, Phone, Instagram } from 'lucide-react';
import copy from '@/assets/Images/Logo/copy.png';
import Telegram from '@/assets/Images/Logo/Telegram.webp';
import whatsapp from '@/assets/Images/Logo/whatsapp.png';
import instagram from '@/assets/Images/Logo/instagram.png';
import rubika from '@/assets/Images/Logo/rubika.png';
import etia from '@/assets/Images/Logo/etia.png';
import soroush from '@/assets/Images/Logo/soroush.jpg';
import chat from '@/assets/Images/Logo/chat.png';

export type ShareType =
  | 'copy'
  | 'telegram'
  | 'whatsapp'
  | 'instagram'
  | 'rubika'
  | 'eitaa'
  | 'soroush'
  | 'livechat';

export type ShareItemConfig = {
  label?: string;
  icon?: React.ReactNode;
  image?: string;
  alt?: string;
  displayMode?: 'icon' | 'image';
  className?: string;
  textClassName?: string;
};

interface Props {
  url?: string;
  title?: string;
  options?: ShareType[];
  customItems?: Partial<Record<ShareType, ShareItemConfig>>;
  liveChatUrl?: string;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

/* =========================
   SSR SAFE URL
========================= */
const getCurrentUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

/* =========================
   COMPONENT
========================= */

export function ShareSocialMedia({
  url = getCurrentUrl(),
  title = '',
  options = ['rubika', 'eitaa', 'soroush', 'telegram', 'whatsapp'],
  customItems = {},
  liveChatUrl,
  className = '',
  buttonClassName = '',
  iconClassName = '',
  textClassName = '',
}: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  /* =========================
     DEFAULT CONFIG
  ========================= */
  const base: Record<ShareType, ShareItemConfig> = {
    copy: {
      label: 'کپی لینک',
      icon: <Link2 className="h-4 w-4" />,
      image: copy,
    },

    telegram: {
      label: 'تلگرام',
      icon: <Send className="h-4 w-4" />,
      image: Telegram,
    },

    whatsapp: {
      label: 'واتساپ',
      icon: <MessageCircle className="h-4 w-4" />,
      image: whatsapp,
    },

    instagram: {
      label: 'اینستاگرام',
      icon: <Instagram className="h-4 w-4" />,
      image: instagram,
    },

    rubika: {
      label: 'روبیکا',
      icon: <Phone className="h-4 w-4" />,
      image: rubika,
    },

    eitaa: {
      label: 'ایتا',
      icon: <Send className="h-4 w-4" />,
      image: etia,
    },

    soroush: {
      label: 'سروش',
      icon: <Send className="h-4 w-4" />,
      image: soroush,
    },

    livechat: {
      label: 'چت آنلاین',
      icon: <MessageCircle className="h-4 w-4" />,
      image: chat,
    },
  };

  /* =========================
     ACTIONS
  ========================= */
  const actions: Record<ShareType, any> = {
    copy: {
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
    },

    telegram: {
      action: () =>
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank'),
    },

    whatsapp: {
      action: () => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank'),
    },

    instagram: {
      action: () => window.open('https://instagram.com', '_blank'),
    },

    rubika: {
      action: () => window.open(`https://rubika.ir/share?url=${encodedUrl}`, '_blank'),
    },

    eitaa: {
      action: () => window.open(`https://eitaa.com/share/url?url=${encodedUrl}`, '_blank'),
    },

    soroush: {
      action: () => window.open(`https://sapp.ir/share?url=${encodedUrl}`, '_blank'),
    },

    livechat: {
      action: () => {
        if (liveChatUrl) window.open(liveChatUrl, '_blank');
      },
    },
  };

  /* =========================
     MERGE ITEMS
  ========================= */
  const items = options.map((key) => ({
    key,
    ...base[key],
    ...customItems[key],
    ...actions[key],
  }));

  /* =========================
     RENDER MEDIA
  ========================= */
  const renderMedia = (item: ShareItemConfig) => {
    const mode = item.displayMode ?? 'image';

    if (mode === 'image' && item.image) {
      return (
        <img
          src={item.image}
          alt={item.alt || item.label || ''}
          className={`h-5 w-5 object-contain ${iconClassName}`}
        />
      );
    }

    return <span className={iconClassName}>{item.icon}</span>;
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, idx) => {
        const isCopy = item.key === 'copy';

        return (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.9 }}
            onClick={item.action}
            aria-label={item.label}
            className={`
              ${buttonClassName}
              ${item.className || ''}
              ${isCopy && copied ? 'bg-green-600 text-white' : ''}
            `}
          >
            {renderMedia(item)}

            <span className={textClassName + ' ' + (item.textClassName || '')}>
              {isCopy && copied ? 'کپی شد' : item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
