import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { pageTranslations } from './locales/pages';
import { productsFilterTranslations } from './locales/productsFilter';
import { sharedTranslations } from './locales/shared';
import { shopTranslations } from './locales/shop';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: {
        translation: {
          ...sharedTranslations.fa,
          ...shopTranslations.fa,
          ...productsFilterTranslations.fa,
          ...pageTranslations.fa,
        },
      },
      en: {
        translation: {
          ...sharedTranslations.en,
          ...shopTranslations.en,
          ...productsFilterTranslations.en,
          ...pageTranslations.en,
        },
      },
    },
    fallbackLng: 'fa',
    supportedLngs: ['fa', 'en'],
    load: 'currentOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });



export default i18n;
