import type { BlogDetail } from '@/utils/blogApi';
import cleanText from '@/utils/cleanText';
import type { ProductDetail, ProductPrice } from '@/utils/shopApi';
import {
  getConfiguredSiteUrl,
  getRouteSeoMeta,
  mergeSeoMeta,
  type SeoLanguage,
  type SeoMeta,
} from './metadata';

function compactDescription(value: string | null | undefined, fallback: string): string {
  const normalized = cleanText(value).replace(/\s+/g, ' ').trim() || fallback;
  if (normalized.length <= 165) return normalized;

  const shortened = normalized.slice(0, 162);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 110 ? lastSpace : 162).trim()}…`;
}

function getAssetUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return undefined;

  try {
    return new URL(filePath.replace(/^\/+/, ''), `${apiUrl.replace(/\/+$/, '')}/`).toString();
  } catch {
    return undefined;
  }
}

function titleWithBrand(title: string, lang: SeoLanguage): string {
  const brand = lang === 'fa' ? 'پولک' : 'Pulak';
  return title.includes(brand) ? title : `${title} | ${brand}`;
}

export function createProductSeoMeta(args: {
  pathname: string;
  lang: SeoLanguage;
  product: ProductDetail;
  price: ProductPrice | null;
  isInStock: boolean;
}): SeoMeta {
  const { pathname, lang, product, price, isInStock } = args;
  const base = getRouteSeoMeta(pathname, lang);
  const translation =
    product.translation ??
    product.translations.find((item) => item.languageCode === lang) ??
    product.translations[0];
  const productName = translation?.name || product.slug;
  const title = titleWithBrand(translation?.metaTitle || productName, lang);
  const description = compactDescription(
    translation?.metaDescription || translation?.shortDescription || translation?.description,
    base.description,
  );
  const mainImage = getAssetUrl(product.mainImage?.filePath);
  const galleryImages = (product.images ?? [])
    .map((item) => getAssetUrl(item.mediaFile?.filePath))
    .filter((item): item is string => Boolean(item));
  const images = [
    ...new Set([mainImage, ...galleryImages].filter((item): item is string => Boolean(item))),
  ];
  const organizationId = `${getConfiguredSiteUrl()}/#organization`;
  const offer =
    price && Number.isFinite(price.displayPrice)
      ? {
          '@type': 'Offer',
          url: base.canonicalUrl,
          price: price.displayPrice,
          priceCurrency: price.currencyCode,
          availability: isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': organizationId },
        }
      : undefined;
  const aggregateRating =
    product.reviewCount && product.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount,
        }
      : undefined;

  return mergeSeoMeta(base, {
    title,
    description,
    openGraphTitle: translation?.ogTitle || title,
    openGraphDescription: compactDescription(translation?.ogDescription, description),
    imageUrl: mainImage || base.imageUrl,
    imageAlt: product.mainImage?.alt || productName,
    imageWidth: mainImage ? undefined : base.imageWidth,
    imageHeight: mainImage ? undefined : base.imageHeight,
    type: 'product',
    noIndex: !product.isPublished,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${base.canonicalUrl}#product`,
      name: productName,
      description,
      url: base.canonicalUrl,
      image: images.length ? images : [base.imageUrl],
      sku: product.sku || undefined,
      category: product.categories?.find((item) => item.isPrimaryCategory)?.name,
      brand: {
        '@type': 'Brand',
        name: product.brand?.name || base.siteName,
      },
      offers: offer,
      aggregateRating,
    },
  });
}

export function createBlogSeoMeta(args: {
  pathname: string;
  lang: SeoLanguage;
  blog: BlogDetail;
}): SeoMeta {
  const { pathname, lang, blog } = args;
  const base = getRouteSeoMeta(pathname, lang);
  const translation = blog.translation;
  const articleTitle = translation?.title || blog.slug;
  const title = titleWithBrand(translation?.metaTitle || articleTitle, lang);
  const description = compactDescription(
    translation?.metaDescription || translation?.excerpt || translation?.content,
    base.description,
  );
  const imageUrl = getAssetUrl(blog.mainImage?.filePath);
  const organizationId = `${getConfiguredSiteUrl()}/#organization`;

  return mergeSeoMeta(base, {
    title,
    description,
    openGraphTitle: translation?.ogTitle || title,
    openGraphDescription: compactDescription(translation?.ogDescription, description),
    imageUrl: imageUrl || base.imageUrl,
    imageAlt: blog.mainImage?.alt || articleTitle,
    imageWidth: imageUrl ? undefined : base.imageWidth,
    imageHeight: imageUrl ? undefined : base.imageHeight,
    type: 'article',
    noIndex: !blog.isPublished,
    publishedTime: blog.publishedAt,
    modifiedTime: blog.updatedAt,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${base.canonicalUrl}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${base.canonicalUrl}#webpage` },
      headline: articleTitle,
      description,
      url: base.canonicalUrl,
      image: imageUrl || base.imageUrl,
      datePublished: blog.publishedAt || blog.createdAt,
      dateModified: blog.updatedAt,
      inLanguage: lang === 'fa' ? 'fa-IR' : 'en',
      author: { '@id': organizationId },
      publisher: { '@id': organizationId },
    },
  });
}
