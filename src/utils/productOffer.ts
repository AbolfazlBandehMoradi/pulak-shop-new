import type { ProductDetail, ProductPrice } from '@/utils/shopApi';

export interface ProductSaleOffer {
  showSalePrice: boolean;
  saleEndDate: string | null;
  regularPrice: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  isTimedOffer: boolean;
}

interface ResolveProductSaleOfferArgs {
  product?: ProductDetail | null;
  currentPrice?: ProductPrice | null;
  selectedVariant?: number | null;
  languageCode?: string | null;
}

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const getFutureDateValue = (value?: string | null): string | null => {
  if (!value) return null;

  const parsedValue = Date.parse(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= Date.now()) {
    return null;
  }

  return value;
};

const getRegularPrice = (price?: ProductPrice | null): number | null => {
  if (!price) return null;

  if (isPositiveNumber(price.originalPrice)) {
    return price.originalPrice;
  }

  return isPositiveNumber(price.price) ? price.price : null;
};

const getSaleEndDate = (price?: ProductPrice | null): string | null => {
  if (!price) return null;

  return getFutureDateValue(price.saleEndDateUtc) ?? getFutureDateValue(price.saleEndDate);
};

const hasSalePrice = (price?: ProductPrice | null): boolean => {
  const regularPrice = getRegularPrice(price);
  return Boolean(
    regularPrice && isPositiveNumber(price?.salePrice) && price.salePrice < regularPrice,
  );
};

const getPriceDiscountPercent = (
  price?: ProductPrice | null,
  regularPriceOverride?: number | null,
  salePriceOverride?: number | null,
): number | null => {
  if (!price && (!regularPriceOverride || !salePriceOverride)) {
    return null;
  }

  if (isPositiveNumber(price?.discountPercent)) {
    return Math.round(price.discountPercent);
  }

  const regularPrice = regularPriceOverride ?? getRegularPrice(price);
  const salePrice = salePriceOverride ?? price?.salePrice ?? null;

  if (!regularPrice || !salePrice || salePrice >= regularPrice) {
    return null;
  }

  return Math.max(1, Math.round(((regularPrice - salePrice) / regularPrice) * 100));
};

const isMatchingVariantPrice = (
  price: ProductPrice,
  selectedVariant: number | null | undefined,
): boolean => {
  const variantId = price.variantId ?? null;

  if (selectedVariant === null || selectedVariant === undefined) {
    return variantId === null;
  }

  return variantId === selectedVariant || variantId === null;
};

const isMatchingLanguagePrice = (
  price: ProductPrice,
  languageCode: string | null | undefined,
): boolean => !languageCode || !price.languageCode || price.languageCode === languageCode;

const getProductPriceCandidates = ({
  product,
  currentPrice,
  selectedVariant,
  languageCode,
}: ResolveProductSaleOfferArgs): ProductPrice[] => {
  const productPrices = product?.prices ?? [];
  const candidates: ProductPrice[] = [];

  if (currentPrice) {
    candidates.push(currentPrice);
  }

  const addUnique = (price: ProductPrice) => {
    const isAlreadyIncluded = candidates.some((candidate) => {
      if (candidate === price) return true;
      if (candidate.id !== undefined && price.id !== undefined) {
        return candidate.id === price.id;
      }

      return false;
    });

    if (!isAlreadyIncluded) {
      candidates.push(price);
    }
  };

  productPrices
    .filter(
      (price) =>
        isMatchingVariantPrice(price, selectedVariant) &&
        isMatchingLanguagePrice(price, languageCode),
    )
    .forEach(addUnique);

  productPrices
    .filter((price) => isMatchingVariantPrice(price, selectedVariant))
    .forEach(addUnique);

  return candidates;
};

export const resolveProductSaleOffer = (args: ResolveProductSaleOfferArgs): ProductSaleOffer => {
  const candidates = getProductPriceCandidates(args);
  const salePriceSource = candidates.find(hasSalePrice) ?? null;
  const dateSource = candidates.find((price) => Boolean(getSaleEndDate(price))) ?? null;
  const activeSource = salePriceSource ?? args.currentPrice ?? dateSource;

  const regularPrice = getRegularPrice(args.currentPrice) ?? getRegularPrice(salePriceSource);
  const salePrice = args.currentPrice?.salePrice ?? salePriceSource?.salePrice ?? null;
  const saleEndDate = getSaleEndDate(dateSource) ?? getSaleEndDate(activeSource);
  const hasActiveSalePrice = Boolean(
    regularPrice && isPositiveNumber(salePrice) && salePrice < regularPrice,
  );
  const hasActiveSignal = Boolean(
    args.currentPrice?.isOnSale ||
    args.currentPrice?.isSaleActive ||
    args.currentPrice?.hasSalePrice ||
    salePriceSource?.isOnSale ||
    salePriceSource?.isSaleActive ||
    salePriceSource?.hasSalePrice ||
    saleEndDate,
  );
  const showSalePrice = hasActiveSalePrice && hasActiveSignal;

  return {
    showSalePrice,
    saleEndDate,
    regularPrice: showSalePrice ? regularPrice : null,
    salePrice: showSalePrice ? salePrice : null,
    discountPercent: showSalePrice
      ? (getPriceDiscountPercent(args.currentPrice, regularPrice, salePrice) ??
        getPriceDiscountPercent(salePriceSource, regularPrice, salePrice))
      : null,
    isTimedOffer: showSalePrice && Boolean(saleEndDate),
  };
};
