import seoMetadata from './metadata.json';
import { DEFAULT_LANG, stripLangPrefix } from '@/utils/langRouting';

export const SEO_LANGUAGES = ['fa', 'en'] as const;
export type SeoLanguage = (typeof SEO_LANGUAGES)[number];

type SeoLanguageMeta = {
  title: string;
  description: string;
};

export type SeoRouteEntry = {
  id: string;
  path: string;
  canonicalPath?: string;
  noIndex?: boolean;
  sitemap: boolean;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  meta: Record<SeoLanguage, SeoLanguageMeta>;
};

type SeoData = {
  site: {
    url: string;
    image: string;
    imageWidth: number;
    imageHeight: number;
    logo: string;
    themeColor: string;
    defaultLanguage: SeoLanguage;
    languages: SeoLanguage[];
    name: Record<SeoLanguage, string>;
  };
  routes: SeoRouteEntry[];
};

export type AlternateLink = {
  hrefLang: string;
  href: string;
};

export type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

export type SeoMeta = {
  routeId: string;
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  siteName: string;
  locale: string;
  alternateLocales: string[];
  type: 'website' | 'article' | 'product';
  robots: string;
  themeColor: string;
  alternates: AlternateLink[];
  structuredData: StructuredData;
  publishedTime?: string;
  modifiedTime?: string;
};

export type SeoMetaOverride = Partial<
  Pick<
    SeoMeta,
    | 'title'
    | 'description'
    | 'openGraphTitle'
    | 'openGraphDescription'
    | 'canonicalUrl'
    | 'imageUrl'
    | 'imageAlt'
    | 'imageWidth'
    | 'imageHeight'
    | 'type'
    | 'structuredData'
    | 'publishedTime'
    | 'modifiedTime'
  >
> & {
  noIndex?: boolean;
};

const data = seoMetadata as SeoData;

export const siteMetadata = data.site;
export const seoRoutes = data.routes;

const langToLocale: Record<SeoLanguage, string> = {
  fa: 'fa_IR',
  en: 'en_US',
};

const langToHtmlLocale: Record<SeoLanguage, string> = {
  fa: 'fa-IR',
  en: 'en',
};

function isSeoLanguage(value: unknown): value is SeoLanguage {
  return typeof value === 'string' && SEO_LANGUAGES.includes(value as SeoLanguage);
}

export function getConfiguredSiteUrl(): string {
  return (import.meta.env.VITE_SITE_URL || siteMetadata.url).replace(/\/+$/, '');
}

export function getPathLanguage(pathname: string): SeoLanguage {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSeoLanguage(firstSegment) ? firstSegment : (DEFAULT_LANG as SeoLanguage);
}

function normalizeRoutePath(path: string): string {
  if (!path || path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function pathSegments(path: string): string[] {
  const normalized = normalizeRoutePath(path);
  return normalized === '/' ? [] : normalized.slice(1).split('/');
}

function routeMatches(route: SeoRouteEntry, basePath: string): boolean {
  const routeSegments = pathSegments(route.path);
  const currentSegments = pathSegments(basePath);

  if (routeSegments.length !== currentSegments.length) return false;

  return routeSegments.every(
    (segment, index) => segment.startsWith(':') || segment === currentSegments[index],
  );
}

function routeScore(route: SeoRouteEntry): number {
  return pathSegments(route.path).reduce(
    (score, segment) => score + (segment.startsWith(':') ? 1 : 3),
    0,
  );
}

export function findSeoRoute(pathname: string): SeoRouteEntry | null {
  const basePath = stripLangPrefix(pathname);
  const routesBySpecificity = [...seoRoutes].sort((a, b) => routeScore(b) - routeScore(a));

  return routesBySpecificity.find((route) => routeMatches(route, basePath)) ?? null;
}

function localizePath(path: string, lang: SeoLanguage): string {
  const normalized = normalizeRoutePath(path);
  return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
}

export function toAbsoluteUrl(value: string, siteUrl = getConfiguredSiteUrl()): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function getCanonicalBasePath(route: SeoRouteEntry | null, pathname: string): string {
  if (route?.canonicalPath !== undefined) return normalizeRoutePath(route.canonicalPath);
  return stripLangPrefix(pathname);
}

function getAlternateLinks(basePath: string, siteUrl: string): AlternateLink[] {
  const links = SEO_LANGUAGES.map((lang) => ({
    hrefLang: langToHtmlLocale[lang],
    href: toAbsoluteUrl(localizePath(basePath, lang), siteUrl),
  }));

  return [
    ...links,
    {
      hrefLang: 'x-default',
      href: toAbsoluteUrl(localizePath(basePath, siteMetadata.defaultLanguage), siteUrl),
    },
  ];
}

function createDefaultStructuredData(meta: {
  canonicalUrl: string;
  description: string;
  imageUrl: string;
  lang: SeoLanguage;
  routeId: string;
  siteName: string;
  siteUrl: string;
  title: string;
}) {
  const organizationId = `${meta.siteUrl}/#organization`;
  const websiteId = `${meta.siteUrl}/#website`;
  const webpageId = `${meta.canonicalUrl}#webpage`;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': meta.routeId === 'about-us' ? 'AboutPage' : 'WebPage',
    '@id': webpageId,
    url: meta.canonicalUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: langToHtmlLocale[meta.lang],
    isPartOf: { '@id': websiteId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: meta.imageUrl,
      width: siteMetadata.imageWidth,
      height: siteMetadata.imageHeight,
    },
  };

  if (meta.routeId !== 'home') return webPage;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: meta.siteName,
      alternateName: meta.lang === 'fa' ? 'فروشگاه پولک' : 'Pulak',
      url: meta.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(siteMetadata.logo, meta.siteUrl),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      url: meta.siteUrl,
      name: meta.siteName,
      inLanguage: langToHtmlLocale[meta.lang],
      publisher: { '@id': organizationId },
    },
    webPage,
  ];
}

export function getRouteSeoMeta(pathname: string, preferredLang?: SeoLanguage): SeoMeta {
  const lang = preferredLang ?? getPathLanguage(pathname);
  const route = findSeoRoute(pathname);
  const fallbackRoute = seoRoutes.find((item) => item.id === 'home') ?? seoRoutes[0];
  const selectedRoute = route ?? fallbackRoute;
  const languageMeta = selectedRoute.meta[lang] ?? selectedRoute.meta[siteMetadata.defaultLanguage];
  const siteUrl = getConfiguredSiteUrl();
  const canonicalBasePath = getCanonicalBasePath(route, pathname);
  const canonicalUrl = toAbsoluteUrl(localizePath(canonicalBasePath, lang), siteUrl);
  const imageUrl = toAbsoluteUrl(siteMetadata.image, siteUrl);
  const isNoIndex = Boolean(selectedRoute.noIndex || !route);
  const siteName = siteMetadata.name[lang] ?? siteMetadata.name[siteMetadata.defaultLanguage];

  const title = route
    ? languageMeta.title
    : lang === 'fa'
      ? 'صفحه پیدا نشد | فروشگاه پولک'
      : 'Page Not Found | Pulak Beauty Shop';
  const description = route
    ? languageMeta.description
    : lang === 'fa'
      ? 'صفحه مورد نظر در فروشگاه زیبایی پولک پیدا نشد.'
      : 'The requested page could not be found on Pulak Beauty Shop.';

  return {
    routeId: route?.id ?? 'not-found',
    title,
    description,
    openGraphTitle: title,
    openGraphDescription: description,
    canonicalUrl,
    imageUrl,
    imageAlt: title,
    imageWidth: siteMetadata.imageWidth,
    imageHeight: siteMetadata.imageHeight,
    siteName,
    locale: langToLocale[lang],
    alternateLocales: SEO_LANGUAGES.filter((item) => item !== lang).map(
      (item) => langToLocale[item],
    ),
    type: 'website',
    robots: isNoIndex
      ? selectedRoute.noIndex
        ? 'noindex,nofollow,noarchive'
        : 'noindex,follow'
      : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    themeColor: siteMetadata.themeColor,
    alternates: isNoIndex ? [] : getAlternateLinks(canonicalBasePath, siteUrl),
    structuredData: createDefaultStructuredData({
      canonicalUrl,
      description,
      imageUrl,
      lang,
      routeId: route?.id ?? 'not-found',
      siteName,
      siteUrl,
      title,
    }),
  };
}

export function mergeSeoMeta(base: SeoMeta, override: SeoMetaOverride | null | undefined): SeoMeta {
  if (!override) return base;

  const merged = { ...base, ...override };

  return {
    ...merged,
    openGraphTitle: override.openGraphTitle ?? override.title ?? base.openGraphTitle,
    openGraphDescription:
      override.openGraphDescription ?? override.description ?? base.openGraphDescription,
    imageAlt: override.imageAlt ?? override.title ?? base.imageAlt,
    robots: override.noIndex ? 'noindex,follow' : base.robots,
    alternates: override.noIndex ? [] : base.alternates,
  };
}
