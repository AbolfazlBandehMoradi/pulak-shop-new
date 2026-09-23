import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(
  await readFile(path.join(projectRoot, 'src', 'seo', 'metadata.json'), 'utf8'),
);
const distDirectory = path.join(projectRoot, 'dist');
const template = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const siteUrl = metadata.site.url.replace(/\/+$/, '');

const htmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const localizedUrl = (routePath, language) => {
  const normalizedPath = String(routePath || '').replace(/^\/+|\/+$/g, '');
  return `${siteUrl}/${language}${normalizedPath ? `/${normalizedPath}` : ''}`;
};

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${htmlEscape(content)}">`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `${tag}</head>`);
}

function buildStructuredData({ canonicalUrl, description, language, routeId, siteName, title }) {
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': routeId === 'about-us' ? 'AboutPage' : 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: language === 'fa' ? 'fa-IR' : 'en',
    isPartOf: { '@id': websiteId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${siteUrl}${metadata.site.image}`,
      width: metadata.site.imageWidth,
      height: metadata.site.imageHeight,
    },
  };

  if (routeId !== 'home') return webPage;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: siteName,
      alternateName: language === 'fa' ? 'فروشگاه پولک' : 'Pulak',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}${metadata.site.logo}` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: siteName,
      inLanguage: language === 'fa' ? 'fa-IR' : 'en',
      publisher: { '@id': organizationId },
    },
    webPage,
  ];
}

function createLocalizedHtml(route, language) {
  const routePath = route.canonicalPath ?? route.path;
  const canonicalUrl = localizedUrl(routePath, language);
  const pageMeta = route.meta[language] ?? route.meta[metadata.site.defaultLanguage];
  const siteName =
    metadata.site.name[language] ?? metadata.site.name[metadata.site.defaultLanguage];
  const locale = language === 'fa' ? 'fa_IR' : 'en_US';
  const alternateLocale = language === 'fa' ? 'en_US' : 'fa_IR';
  const imageUrl = `${siteUrl}${metadata.site.image}`;
  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const alternates = metadata.site.languages
    .map((alternateLanguage) => {
      const hrefLang = alternateLanguage === 'fa' ? 'fa-IR' : alternateLanguage;
      return `<link rel="alternate" hreflang="${hrefLang}" href="${localizedUrl(routePath, alternateLanguage)}">`;
    })
    .concat(
      `<link rel="alternate" hreflang="x-default" href="${localizedUrl(routePath, metadata.site.defaultLanguage)}">`,
    )
    .join('');
  const structuredData = buildStructuredData({
    canonicalUrl,
    description: pageMeta.description,
    language,
    routeId: route.id,
    siteName,
    title: pageMeta.title,
  });

  let html = template
    .replace(/<html\s+lang="[^"]+"\s+dir="[^"]+">/i, `<html lang="${language}" dir="${direction}">`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(pageMeta.title)}</title>`)
    .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalUrl}">`)
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]+"[^>]*>\s*/gi, '')
    .replace(
      /<script\s+id="seo-structured-data"[^>]*>[\s\S]*?<\/script>/i,
      `<script id="seo-structured-data" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`,
    );

  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    (canonicalTag) => `${canonicalTag}${alternates}`,
  );

  const values = [
    ['name', 'description', pageMeta.description],
    ['name', 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'],
    [
      'name',
      'googlebot',
      'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    ],
    ['name', 'theme-color', metadata.site.themeColor],
    ['property', 'og:locale', locale],
    ['property', 'og:locale:alternate', alternateLocale],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', siteName],
    ['property', 'og:url', canonicalUrl],
    ['property', 'og:title', pageMeta.title],
    ['property', 'og:description', pageMeta.description],
    ['property', 'og:image', imageUrl],
    ['property', 'og:image:secure_url', imageUrl],
    ['property', 'og:image:width', metadata.site.imageWidth],
    ['property', 'og:image:height', metadata.site.imageHeight],
    ['property', 'og:image:alt', pageMeta.title],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', pageMeta.title],
    ['name', 'twitter:description', pageMeta.description],
    ['name', 'twitter:image', imageUrl],
    ['name', 'twitter:image:alt', pageMeta.title],
  ];

  for (const [attribute, key, value] of values) {
    html = replaceMeta(html, attribute, key, value);
  }

  return html;
}

const routesToPrerender = metadata.routes.filter(
  (route) => route.sitemap && !route.noIndex && !route.path.includes(':'),
);

await Promise.all(
  routesToPrerender.flatMap((route) =>
    metadata.site.languages.map(async (language) => {
      const targetDirectory = path.join(
        distDirectory,
        language,
        ...String(route.path || '')
          .split('/')
          .filter(Boolean),
      );
      await mkdir(targetDirectory, { recursive: true });
      await writeFile(
        path.join(targetDirectory, 'index.html'),
        createLocalizedHtml(route, language),
        'utf8',
      );
    }),
  ),
);

console.log(
  `Created ${routesToPrerender.length * metadata.site.languages.length} localized SEO HTML snapshots.`,
);
