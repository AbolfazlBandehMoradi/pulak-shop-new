import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link2, MessageCircle, Phone, Send } from 'lucide-react';

import copy from '@/assets/Images/Logo/copy.png';
import Telegram from '@/assets/Images/Logo/Telegram.webp';
import whatsapp from '@/assets/Images/Logo/whatsapp.png';
import instagram from '@/assets/Images/Logo/instagram.png';
import rubika from '@/assets/Images/Logo/rubika.png';
import etia from '@/assets/Images/Logo/etia.png';
import soroush from '@/assets/Images/Logo/soroush.jpg';
import bale from '@/assets/Images/Logo/bale.jpg';
import chat from '@/assets/Images/Logo/chat.png';

import { copyToClipboard } from '@/utils/url';

export type ShareType =
  | 'copy'
  | 'telegram'
  | 'whatsapp'
  | 'instagram'
  | 'bale'
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
  imageClassName?: string;
  copiedLabel?: string;
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

const getCurrentUrl = () => (typeof window !== 'undefined' ? window.location.href : '');

export function ShareSocialMedia({
  url = getCurrentUrl(),
  title = '',
  options = ['bale', 'telegram', 'whatsapp', 'rubika', 'eitaa', 'soroush'],
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

  const base: Record<ShareType, ShareItemConfig> = {
    copy: {
      label: 'Copy link',
      icon: <Link2 className="h-4 w-4" />,
      image: copy,
    },

    bale: {
      label: 'Bale',
      icon: <Send className="h-4 w-4" />,
      image: bale,
    },

    telegram: {
      label: 'Telegram',
      icon: <Send className="h-4 w-4" />,
      image: Telegram,
    },

    whatsapp: {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      image: whatsapp,
    },

    instagram: {
      label: 'Instagram',
      icon: <MessageCircle className="h-4 w-4" />,
      image: instagram,
    },

    rubika: {
      label: 'Rubika',
      icon: <Phone className="h-4 w-4" />,
      image: rubika,
    },

    eitaa: {
      label: 'Eitaa',
      icon: <Send className="h-4 w-4" />,
      image: etia,
    },

    soroush: {
      label: 'Soroush',
      icon: <Send className="h-4 w-4" />,
      image: soroush,
    },

    livechat: {
      label: 'Live chat',
      icon: <MessageCircle className="h-4 w-4" />,
      image: chat,
    },
  };

  const actions: Record<ShareType, () => void | Promise<void>> = {
    copy: async () => {
      const ok = await copyToClipboard(url);

      if (!ok) return;

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    },

    bale: () => {
      window.open(`https://ble.ir/share?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
    },

    telegram: () => {
      window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
    },

    whatsapp: () => {
      window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
    },

    instagram: () => {
      window.open('https://instagram.com', '_blank');
    },

    rubika: () => {
      window.open(`https://rubika.ir/share?url=${encodedUrl}`, '_blank');
    },

    eitaa: () => {
      window.open(`https://eitaa.com/share/url?url=${encodedUrl}`, '_blank');
    },

    soroush: () => {
      window.open(`https://sapp.ir/share?url=${encodedUrl}`, '_blank');
    },

    livechat: () => {
      if (liveChatUrl) {
        window.open(liveChatUrl, '_blank');
      }
    },
  };

  const items = options.map((key) => ({
    key,
    ...base[key],
    ...customItems[key],
    action: actions[key],
  }));

  const renderMedia = (item: ShareItemConfig) => {
    const mode = item.displayMode ?? 'image';

    if (mode === 'image' && item.image) {
      return (
        <img
          src={item.image}
          alt={item.alt || item.label || ''}
          className={`${item.imageClassName || 'h-5 w-5'} object-contain ${iconClassName}`}
        />
      );
    }

    return <span className={iconClassName}>{item.icon}</span>;
  };

  return (
    <div className={className || 'flex flex-wrap gap-2'}>
      {items.map((item) => {
        const isCopy = item.key === 'copy';

        return (
          <motion.button
            key={item.key}
            type="button"
            whileTap={{
              scale: 0.94,
            }}
            onClick={item.action}
            aria-label={item.label}
            className={`
              ${buttonClassName}
              ${item.className || ''}
              ${isCopy && copied ? 'bg-first text-white' : ''}
            `}
          >
            {renderMedia(item)}

            <span
              className={`
              ${textClassName}
              ${item.textClassName || ''}
            `}
            >
              {isCopy && copied ? item.copiedLabel || 'Copied' : item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
