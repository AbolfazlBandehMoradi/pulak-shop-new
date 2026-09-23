import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadataPath = path.join(projectRoot, 'src', 'seo', 'metadata.json');
const publicDirectory = path.join(projectRoot, 'public');
const seoImageSource = path.join(projectRoot, 'src', 'assets', 'Images', 'Banner', '1.png');
const logoSource = path.join(projectRoot, 'src', 'assets', 'Images', 'Logo', 'MainLogo.png');
const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));

const { site, routes } = metadata;
const siteUrl = site.url.replace(/\/+$/, '');
const languages = site.languages;

if (!/^https:\/\//.test(siteUrl)) {
  throw new Error('SEO site URL must be an absolute HTTPS URL.');
}

if (!Array.isArray(languages) || languages.length === 0) {
  throw new Error('SEO metadata must define at least one site language.');
}

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const localizedUrl = (routePath, language) => {
  const normalizedPath = String(routePath || '').replace(/^\/+|\/+$/g, '');
  return `${siteUrl}/${language}${normalizedPath ? `/${normalizedPath}` : ''}`;
};

const hrefLanguageTag = (language) => (language === 'fa' ? 'fa-IR' : language);

const sitemapRoutes = routes.filter((route) => route.sitemap && !route.noIndex);

for (const route of sitemapRoutes) {
  if (route.path.includes(':')) {
    throw new Error(
      `Dynamic route "${route.path}" needs concrete URLs before entering the sitemap.`,
    );
  }
}

const sitemapEntries = sitemapRoutes.flatMap((route) =>
  languages.map((language) => {
    const canonicalPath = route.canonicalPath ?? route.path;
    const alternateLinks = languages
      .map(
        (alternateLanguage) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(hrefLanguageTag(alternateLanguage))}" href="${escapeXml(localizedUrl(canonicalPath, alternateLanguage))}" />`,
      )
      .concat(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localizedUrl(canonicalPath, site.defaultLanguage))}" />`,
      )
      .join('\n');

    return [
      '  <url>',
      `    <loc>${escapeXml(localizedUrl(canonicalPath, language))}</loc>`,
      alternateLinks,
      `    <changefreq>${escapeXml(route.changefreq)}</changefreq>`,
      `    <priority>${Number(route.priority).toFixed(2)}</priority>`,
      '  </url>',
    ].join('\n');
  }),
);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...sitemapEntries,
  '</urlset>',
  '',
].join('\n');

const blockedPaths = routes
  .filter((route) => route.noIndex)
  .flatMap((route) =>
    languages.map((language) => {
      const normalizedPath = String(route.path).replace(/^\/+|\/+$/g, '');
      return `Disallow: /${language}/${normalizedPath}`;
    }),
  );

const robots = [
  'User-agent: *',
  'Allow: /',
  ...blockedPaths,
  '',
  `Sitemap: ${siteUrl}/sitemap.xml`,
  '',
].join('\n');

await Promise.all([
  writeFile(path.join(publicDirectory, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(path.join(publicDirectory, 'robots.txt'), robots, 'utf8'),
  copyFile(seoImageSource, path.join(publicDirectory, 'og-image.png')),
  copyFile(logoSource, path.join(publicDirectory, 'logo.png')),
]);

console.log(
  `Generated SEO assets and sitemap entries for ${sitemapEntries.length} localized public URLs.`,
);
