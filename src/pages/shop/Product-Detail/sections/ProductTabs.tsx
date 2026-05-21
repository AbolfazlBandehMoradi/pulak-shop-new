import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductDetail } from '@/utils/shopApi';
import cleanText from '@/utils/cleanText';
import { FileText, ListChecks } from 'lucide-react';

interface ProductTabsProps {
  product: ProductDetail | null;
}

type TabType = 'description' | 'specifications';

export function ProductTabs({ product }: ProductTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('description');

  const translation = product?.translation || product?.translations?.[0];
  const attributeValues = product?.attributeValues ?? [];
  const categories = product?.categories ?? [];
  const tags = product?.tags ?? [];

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'description',
      label: t('product.description') || 'Description',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'specifications',
      label: t('product.specifications') || 'Specifications',
      icon: <ListChecks className="w-4 h-4" />,
    },
  ];

  // ===== UI COMPONENTS =====

  const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/30 backdrop-blur-sm px-5">
      {children}
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-s-medium text-first bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
        {value || '-'}
      </span>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 whitespace-nowrap border backdrop-blur-sm',
                  isActive
                    ? 'bg-first text-white border-first shadow-md shadow-first/20 scale-[1.02]'
                    : 'bg-gray-100/70 dark:bg-gray-800/60 border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-700/70 text-muted-foreground',
                )}
              >
                <span className={cn('transition-transform duration-300', isActive && 'scale-110')}>
                  {tab.icon}
                </span>
                <span className={cn(isActive ? 'font-s-bold' : 'font-s-medium')}>{tab.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-xl border border-white/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {/* ================= DESCRIPTION TAB ================= */}
          {activeTab === 'description' && (
            <div>
              <h2 className="w-full font-s-bold first-text-color text-xl mt-2">
                {t('product.description')}
              </h2>
              <p className="text leading-8 text-muted-foreground">
                {translation?.description
                  ? cleanText(translation.description)
                  : t('product.noDescription') || 'No description available.'}
              </p>
              {attributeValues.length > 0 && (
                <InfoBox>
                  {attributeValues.map((attr) => (
                    <InfoRow key={attr.id} label={attr.attributeName} value={attr.customValue} />
                  ))}
                </InfoBox>
              )}

              {/* ===== Product Info ===== */}
              <InfoBox>
                {categories.length > 0 && (
                  <InfoRow
                    label={t('product.category') || 'Category'}
                    value={categories.map((c) => c.name).join(' / ')}
                  />
                )}

                {product?.translation?.countryOfOriginDisplay && (
                  <InfoRow
                    label={t('product.country') || 'Country'}
                    value={product.translation.countryOfOriginDisplay}
                  />
                )}

                {product?.translation?.moneyBackPolicy && (
                  <InfoRow
                    label={t('product.return') || 'Return'}
                    value={product.translation.moneyBackPolicy}
                  />
                )}

                {product?.translation?.shippingLeadTime && (
                  <InfoRow
                    label={t('product.shippingTime') || 'Shipping'}
                    value={product.translation.shippingLeadTime}
                  />
                )}
              </InfoBox>

              {/* Shipping description */}
              {product?.translation?.shippingMethodsDescription && (
                <p className="mt-4 text-sm text-muted-foreground leading-7">
                  {product.translation.shippingMethodsDescription}
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= SPECIFICATIONS TAB ================= */}
          {activeTab === 'specifications' && (
            <div>
              {product?.specificationsJson ? (
                (() => {
                  try {
                    const data = JSON.parse(product.specificationsJson);
                    const entries = Object.entries(data || {});

                    if (!entries.length) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          {t('product.noSpecifications') || 'No specifications available.'}
                        </p>
                      );
                    }

                    return (
                      <InfoBox>
                        {entries.map(([key, value]) => (
                          <InfoRow key={key} label={key} value={String(value)} />
                        ))}
                      </InfoBox>
                    );
                  } catch {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {t('product.noSpecifications') || 'No specifications available.'}
                      </p>
                    );
                  }
                })()
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('product.noSpecifications') || 'No specifications available.'}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
