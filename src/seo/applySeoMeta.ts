import type { AlternateLink, SeoMeta } from './metadata';

function setMeta(attribute: 'name' | 'property', key: string, content?: string | number) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (content === undefined || content === '') {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.dataset.seoManaged = 'true';
    document.head.appendChild(element);
  }

  element.setAttribute('content', String(content));
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.dataset.seoManaged = 'true';
    document.head.appendChild(element);
  }

  element.href = href;
}

function setAlternates(alternates: AlternateLink[]) {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove());

  alternates.forEach((alternate) => {
    const element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = alternate.hrefLang;
    element.href = alternate.href;
    element.dataset.seoManaged = 'true';
    document.head.appendChild(element);
  });
}

function setAlternateLocales(locales: string[]) {
  document.head
    .querySelectorAll('meta[property="og:locale:alternate"]')
    .forEach((element) => element.remove());

  locales.forEach((locale) => {
    const element = document.createElement('meta');
    element.setAttribute('property', 'og:locale:alternate');
    element.setAttribute('content', locale);
    element.dataset.seoManaged = 'true';
    document.head.appendChild(element);
  });
}

function setStructuredData(meta: SeoMeta) {
  const id = 'seo-structured-data';
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(meta.structuredData).replace(/</g, '\\u003c');
}

function getImageMimeType(imageUrl: string): string | undefined {
  const pathname = imageUrl.split(/[?#]/, 1)[0].toLowerCase();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

export function applySeoMeta(meta: SeoMeta) {
  document.title = meta.title;

  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.robots);
  setMeta('name', 'googlebot', meta.robots);
  setMeta('name', 'theme-color', meta.themeColor);

  setMeta('property', 'og:title', meta.openGraphTitle);
  setMeta('property', 'og:description', meta.openGraphDescription);
  setMeta('property', 'og:url', meta.canonicalUrl);
  setMeta('property', 'og:type', meta.type);
  setMeta('property', 'og:site_name', meta.siteName);
  setMeta('property', 'og:locale', meta.locale);
  setMeta('property', 'og:image', meta.imageUrl);
  setMeta('property', 'og:image:secure_url', meta.imageUrl);
  setMeta('property', 'og:image:type', getImageMimeType(meta.imageUrl));
  setMeta('property', 'og:image:width', meta.imageWidth);
  setMeta('property', 'og:image:height', meta.imageHeight);
  setMeta('property', 'og:image:alt', meta.imageAlt);
  setAlternateLocales(meta.alternateLocales);

  setMeta('property', 'article:published_time', meta.publishedTime);
  setMeta('property', 'article:modified_time', meta.modifiedTime);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', meta.openGraphTitle);
  setMeta('name', 'twitter:description', meta.openGraphDescription);
  setMeta('name', 'twitter:image', meta.imageUrl);
  setMeta('name', 'twitter:image:alt', meta.imageAlt);

  setCanonical(meta.canonicalUrl);
  setAlternates(meta.alternates);
  setStructuredData(meta);
}
