import { Category } from "@/types";

export const getCategoryChildren = (category: Category): Category[] =>
  category.children ?? category.subcategories ?? [];

export const getAllCategoryIds = (category: Category): string[] => {
  const ids = [category.id];

  getCategoryChildren(category).forEach((child) => {
    ids.push(...getAllCategoryIds(child));
  });

  return ids;
};