import { motion } from 'framer-motion';
import {
  Zap,
  Droplet,
  Snowflake,
  Box,
  Info,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductDetail, ProductAttributeValue } from '@/utils/shopApi';
import cleanText from '@/utils/cleanText';
import { ShareSocialMedia } from '@/components/reusable-components/ShareSocialMedia/ShareSocialMedia';

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

export function ProductInfo({ product, loading, languageCode: _languageCode }: ProductInfoProps) {
  const { t } = useTranslation();
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
      {product?.categories?.length ? (
        <div className="flex flex-wrap font-s-light text-secound">
          <span className="text-sm">{product.categories[product.categories.length - 1]?.name}</span>
        </div>
      ) : null}
      <motion.h1
        className="text-xl font-s-bold first-text-color"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {translation?.name}
      </motion.h1>
      <div className="">
        {translation?.description && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="w-full text-sm first-text-color-for-paragraph leading-7 mt-2  ">
              {cleanText(translation.shortDescription)}
            </p>
          </motion.div>
        )}
      </div>
      {product.attributeValues && product.attributeValues.length > 0 && (
        <>
          <h2 className="w-full font-s-medium first-text-color text-lg mt-2">
            {t('product.keyFeatures')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 font-s-bold gap-2 mt-2">
            {product.attributeValues.map((attr, index) => {
              const Icon = getAttributeIcon(attr);
              const value = attr.optionLabel || attr.customValue || attr.optionValue || '-';
              return (
                <motion.div
                  key={attr.id}
                  className="flex flex-col text-sm rounded-sm gap-1 bg-color-for-layer-sec px-2 py-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {/* ATTRIBUTE NAME */}
                  <div className="group relative flex items-center gap-1">
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0 text-first" />
                    )}
                    <span className="first-text-color-for-paragraph w-full truncate whitespace-nowrap overflow-hidden text-xs block">
                      {attr.attributeName}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-color-for-body-opposite  first-text-color-for-paragraph-opposite font-f-normal text-sm px-2 py-1 rounded">
                      {attr.attributeName}
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-1">
                    <span className="first-text-color w-full truncate whitespace-nowrap overflow-hidden block">
                      {value}
                    </span>
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-color-for-body-opposite  first-text-color-for-paragraph-opposite font-f-normal text-sm px-2 py-1 rounded ">
                      {value}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
      <div className=" mt-4  rounded-sm ">
        <h2 className="w-full  font-s-medium first-text-color text-lg mb-2">
          {t('productDetail.consultation.title')}
        </h2>
        <ShareSocialMedia
          options={['rubika', 'soroush', 'eitaa']}
          className="grid grid-cols-3 gap-2"
          customItems={{
            rubika: {
              displayMode: 'image',
              className:
                'flex items-center justify-center text-color-first border border-secound-200 gap-2  first-text-color px-2 py-2 rounded-md transition hover:bg-secound-200',
            },
            soroush: {
              displayMode: 'image',
              className:
                'flex items-center justify-center text-color-first border border-secound-200 gap-2  first-text-color px-2 py-2 rounded-md transition  hover:bg-secound-200',
            },
            eitaa: {
              displayMode: 'image',
              className:
                'flex items-center justify-center text-color-first border border-secound-200 gap-2  first-text-color px-2 py-2 rounded-md transition  hover:bg-secound-200',
            },
          }}
        />
      </div>
    </div>
  );
}
