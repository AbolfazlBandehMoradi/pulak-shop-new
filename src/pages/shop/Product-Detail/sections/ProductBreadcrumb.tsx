import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/i18n/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import type { ProductDetail } from '@/utils/shopApi';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface ProductBreadcrumbProps {
  loading: boolean;
  isRTL: boolean;
  product: ProductDetail | null;
  productName?: string;
}

export function ProductBreadcrumb({
  loading,
  isRTL,
  product,
  productName,
}: ProductBreadcrumbProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();

  return (
    <nav
      className={cn(
        'flex items-center overflow-x-auto whitespace-nowrap px-2 py-2 lg:py-1 text-sm scrollbar-hide',
        isRTL ? 'flex-row' : 'flex-row-reverse',
      )}
    >
      <Link
        to={localizedPath('/products')}
        className="shrink-0  first-text-color-for-paragraph hover:text-first"
      >
        {t('product.product')}
      </Link>
      <ChevronLeftIcon
        className={cn('h-4 w-4 shrink-0 first-text-color-svg ', isRTL ? 'rotate-0' : 'rotate-180')}
      />
      {product?.categories && product.categories.length > 0 && (
        <>
          <Link
            to={localizedPath(`/products?categoryIds=${product.categories[0].id}`)}
            className="first-text-color-for-paragraph hover:text-first"
          >
            {product.categories[0].name}
          </Link>
          <ChevronLeftIcon
            className={cn('h-4 w-4 first-text-color-svg', isRTL ? 'rotate-0' : 'rotate-180')}
          />
        </>
      )}

      {loading ? (
        <Skeleton className="h-4 w-32 shrink-0" />
      ) : (
        <span className="shrink-0 text-first ">{productName}</span>
      )}
    </nav>
  );
}
