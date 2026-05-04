import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import faTranslations from './locales/fa.json';
import enTranslations from './locales/en.json';
import faAbout from './locales/fa/about.json';
import enAbout from './locales/en/about.json';
import faBlog from './locales/fa/blog.json';
import enBlog from './locales/en/blog.json';
import faProduct from './locales/fa/product.json';
import enProduct from './locales/en/product.json';
import faPrivete from './locales/fa/privete.json';
import enPrivete from './locales/en/privete.json';
import faStatic from './locales/fa/static.json';
import enStatic from './locales/en/static.json';
import faFooter from './locales/fa/footer.json';
import enFooter from './locales/en/footer.json';
import faFaq from './locales/fa/faq.json';
import enFaq from './locales/en/faq.json';
import faAuth from './locales/fa/Auth.json';
import enAuth from './locales/en/Auth.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fa: {
        translation: {
          ...faTranslations,
          about: faAbout,
          footer: faFooter,
          blog: faBlog,
          product: faProduct,
          static: faStatic,
          privete: faPrivete,
          faq: faFaq,
          auth: faAuth,
        },
      },
      en: {
        translation: {
          ...enTranslations,
          about: enAbout,
          footer: enFooter,
          blog: enBlog,
          product: enProduct,
          static: enStatic,
          privete: enPrivete,
          faq: enFaq,
          auth: enAuth,
        },
      },
    },
    fallbackLng: 'fa',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });



export default i18n;
