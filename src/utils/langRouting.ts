export const SUPPORTED_LANGS = ['fa', 'en', 'ar'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export type LanguageDirection = 'rtl' | 'ltr';

export const DEFAULT_LANG: SupportedLang = 'fa';

const LANGUAGE_DIRECTIONS: Record<SupportedLang, LanguageDirection> = {
  fa: 'rtl',
  en: 'ltr',
  ar: 'rtl',
};

const LANGUAGE_LOCALES: Record<SupportedLang, string> = {
  fa: 'fa-IR',
  en: 'en-US',
  ar: 'ar',
};

export function getLanguageDirection(lang: SupportedLang): LanguageDirection {
  return LANGUAGE_DIRECTIONS[lang];
}

export function getLanguageLocale(lang: SupportedLang): string {
  return LANGUAGE_LOCALES[lang];
}

export function getLocaleForLanguageCode(lang: string | null | undefined): string {
  const baseLang = lang?.toLowerCase().split('-')[0];
  return isSupportedLang(baseLang) ? getLanguageLocale(baseLang) : LANGUAGE_LOCALES.en;
}

export function isRtlLanguageCode(lang: string | null | undefined): boolean {
  const baseLang = lang?.toLowerCase().split('-')[0];
  return isSupportedLang(baseLang) && isRtlLanguage(baseLang);
}

export function isRtlLanguage(lang: SupportedLang): boolean {
  return getLanguageDirection(lang) === 'rtl';
}

export function isSupportedLang(value: unknown): value is SupportedLang {
  return typeof value === 'string' && SUPPORTED_LANGS.includes(value as SupportedLang);
}

export function stripLangPrefix(pathname: string): string {
  if (!pathname.startsWith('/')) return pathname;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';

  if (!isSupportedLang(segments[0])) return pathname;

  const remainingPath = segments.slice(1).join('/');
  return remainingPath ? `/${remainingPath}` : '/';
}

export function withLangPath(path: string, lang: SupportedLang): string {
  if (!path) return `/${lang}`;
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  const match = normalized.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);

  if (!match) return normalized;

  const pathname = match[1] || '/';
  const search = match[2] || '';
  const hash = match[3] || '';

  const withoutLang = stripLangPrefix(pathname);
  const localizedPath = withoutLang === '/' ? `/${lang}` : `/${lang}${withoutLang}`;

  return `${localizedPath}${search}${hash}`;
}

export function replacePathLanguage(path: string, lang: SupportedLang): string {
  return withLangPath(path, lang);
}
