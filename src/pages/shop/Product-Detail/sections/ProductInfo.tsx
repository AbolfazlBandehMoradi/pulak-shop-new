import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Star, Clock, Tag, Zap, Droplet, Snowflake, Box, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductDetail, ProductAttributeValue } from '@/utils/shopApi';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface ProductInfoProps {
  product: ProductDetail | null;
  loading?: boolean;
  languageCode: string;
  effectiveLangCode?: string;
}

// Icon mapping for common attribute types
const attributeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: Zap,
  color: Droplet,
  material: Box,
  frost: Snowflake,
  default: Info,
};

// Helper function to strip HTML tags and convert to plain text
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // Fallback for SSR: use regex to strip tags
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
  // Create a temporary DOM element to parse HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Get text content and clean up extra whitespace
  return (tmp.textContent || tmp.innerText || '').trim();
};

export function ProductInfo({ product, loading, languageCode }: ProductInfoProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();

  const translation = product?.translation || product?.translations?.[0];

  // Get icon for attribute
  const getAttributeIcon = (attr: ProductAttributeValue) => {
    const code = attr.attributeCode?.toLowerCase() || '';
    if (code.includes('energy')) return attributeIcons.energy;
    if (code.includes('color')) return attributeIcons.color;
    if (code.includes('material')) return attributeIcons.material;
    if (code.includes('frost')) return attributeIcons.frost;
    return attributeIcons.default;
  };

  if (loading || !product) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        className="text-2xl font-s-sbold first-text-color"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {translation?.name}
      </motion.h1>
      {translation?.shortDescription && (
        <motion.div
          className=""
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm first-text-color-for-paragraph mt-2">
            {stripHtml(translation.shortDescription)}
          </p>
        </motion.div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        {product.reviewCount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {product.reviewCount} {t('product.reviews') || 'reviews'}
            </span>
          </div>
        )}

        {product.averageRating !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.round(product.averageRating!)
                      ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600',
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.averageRating.toFixed(1)} / 5</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {(() => {
              try {
                return new Date(product.updatedAt).toLocaleDateString(
                  languageCode === 'fa' ? 'fa-IR' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                );
              } catch {
                return new Date(product.updatedAt).toLocaleDateString();
              }
            })()}
          </span>
        </div>
      </div>
      {/* All Attributes - Displayed under title */}
      {product.attributeValues && product.attributeValues.length > 0 && (
        <div className="pt-2 pb-3 border-t dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {product.attributeValues.map((attr) => {
              const Icon = getAttributeIcon(attr);
              const value = attr.optionLabel || attr.customValue || attr.optionValue || '-';

              return (
                <motion.div
                  key={attr.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border',
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: product.attributeValues!.indexOf(attr) * 0.03 }}
                >
                  <Icon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-muted-foreground dark:text-gray-400 font-medium">
                    {attr.attributeName}:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{value}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand, SKU, and Tags */}
      <div className="pt-3 border-t dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Brand */}
          {product.brand && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t('product.brand') || 'Brand'}:{' '}
                <span className="text-foreground font-medium">{product.brand.name}</span>
              </span>
            </div>
          )}

          {/* SKU */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              SKU: <span className="text-foreground font-medium">{product.sku}</span>
            </span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={localizedPath(`/products?tag=${tag.slug}`)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-muted dark:bg-gray-800 rounded-full text-sm hover:bg-muted/80 dark:hover:bg-gray-700 transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Description */}
    </div>
  );
}
