import { type Language } from "@/types";
import { type Product, type ProductTranslation } from "@/utils/shopApi";

export type CatalogProduct = Product & {
  inStock?: boolean;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  stockStatus?: string;
  availableQuantity?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  inventory?: CatalogProductInventoryLike[] | CatalogProductInventoryLike;
};

export interface CatalogProductInventoryLike {
  availableQuantity?: number;
  quantity?: number;
  stockStatus?: string;
  trackInventory?: boolean;
  allowBackorders?: boolean;
}

export type GetProductImageUrl = (product: CatalogProduct) => string | null;

export interface ProductViewProps {
  products: CatalogProduct[];
  lang: Language;
  getImageUrl: GetProductImageUrl;
}

export const getProductTranslation = (
  product: CatalogProduct,
  lang: Language
): ProductTranslation | undefined => {
  return (
    product.translations.find((translation) => translation.languageCode === lang) ??
    product.translations[0]
  );
};

export const getProductPrice = (product: CatalogProduct): number => {
  return product.salePrice ?? product.price ?? 0;
};

export const getProductOriginalPrice = (
  product: CatalogProduct
): number | undefined => {
  if (
    typeof product.price === "number" &&
    typeof product.salePrice === "number" &&
    product.salePrice < product.price
  ) {
    return product.price;
  }

  return product.originalPrice;
};

export const getProductDiscount = (
  product: CatalogProduct
): number | undefined => {
  if (typeof product.discountPercent === "number") {
    return product.discountPercent;
  }

  return typeof product.discount === "number" ? product.discount : undefined;
};

export const isProductInStock = (product: CatalogProduct): boolean => {
  const hasStockQuantity = Object.prototype.hasOwnProperty.call(
    product,
    "stockQuantity"
  );
  if (hasStockQuantity) {
    return typeof product.stockQuantity === "number" && product.stockQuantity > 0;
  }

  const parseStockStatus = (stockStatus?: string): boolean | undefined => {
    if (!stockStatus) return undefined;

    const normalized = stockStatus.toLowerCase().replace(/[\s_-]/g, "");

    if (
      normalized === "instock" ||
      normalized === "available" ||
      normalized === "onbackorder" ||
      normalized === "backorder"
    ) {
      return true;
    }

    if (
      normalized === "outofstock" ||
      normalized === "unavailable" ||
      normalized === "soldout" ||
      normalized === "nostock"
    ) {
      return false;
    }

    return undefined;
  };

  const resolveInventorySnapshot = (
    inventory: CatalogProductInventoryLike
  ): boolean | undefined => {
    const statusFromInventory = parseStockStatus(inventory.stockStatus);
    if (typeof statusFromInventory === "boolean") {
      return statusFromInventory;
    }

    if (inventory.trackInventory === false) {
      return true;
    }

    if (inventory.allowBackorders) {
      return true;
    }

    if (typeof inventory.availableQuantity === "number") {
      return inventory.availableQuantity > 0;
    }

    if (typeof inventory.quantity === "number") {
      return inventory.quantity > 0;
    }

    return undefined;
  };

  if (typeof product.inStock === "boolean") {
    return product.inStock;
  }

  const statusFromRoot = parseStockStatus(product.stockStatus);
  if (typeof statusFromRoot === "boolean") {
    return statusFromRoot;
  }

  if (product.trackInventory === false) {
    return true;
  }

  if (product.allowBackorders) {
    return true;
  }

  if (typeof product.availableQuantity === "number") {
    return product.availableQuantity > 0;
  }

  if (Array.isArray(product.inventory)) {
    for (const inventoryItem of product.inventory) {
      const resolvedStock = resolveInventorySnapshot(inventoryItem);
      if (typeof resolvedStock === "boolean") {
        return resolvedStock;
      }
    }
  } else if (product.inventory) {
    const resolvedStock = resolveInventorySnapshot(product.inventory);
    if (typeof resolvedStock === "boolean") {
      return resolvedStock;
    }
  }

  return true;
};
