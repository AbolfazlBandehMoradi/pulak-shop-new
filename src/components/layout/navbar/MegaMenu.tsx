import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Gamepad,
  Camera,
  Home,
  Shirt,
} from "lucide-react";
import { Category } from "@/types";
import { getCategories } from "@/utils/indexApi";

// Helper to map category slugs to icons
const getIcon = (slug: string) => {
  switch (slug) {
    case "mobile":
      return Smartphone;
    case "laptop":
      return Laptop;
    case "smartwatch":
      return Watch;
    case "audio":
      return Headphones;
    case "gaming":
      return Gamepad;
    case "camera":
      return Camera;
    case "home":
      return Home;
    case "fashion":
      return Shirt;
    default:
      return Smartphone;
  }
};

export const MegaMenu: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const {
    data: categories = [],
    isLoading: loading,
    isError: hasCategoryError,
  } = useQuery<Category[]>({
    queryKey: ["mega-menu-categories", i18n.language],
    queryFn: () => getCategories(i18n.language),
    staleTime: 5 * 60 * 1000,
  });

  // Active Category State (Default to first one)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Keep selection in sync when query data updates.
  useEffect(() => {
    if (categories.length === 0) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory((current) => {
      if (!current) return categories[0];
      return categories.find((category) => category.id === current.id) || categories[0];
    });
  }, [categories]);

  const getCategoryName = (cat: Category) =>
    isRTL ? cat.name : cat.nameEn || cat.name;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-b-3xl shadow-2xl border-x border-b border-zinc-200 dark:border-zinc-800 overflow-hidden flex h-100">
      {/* --- SIDEBAR (Parent Categories) --- */}
      <div className="w-1/4 min-w-50 border-e border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            {isRTL ? "در حال بارگذاری..." : "Loading..."}
          </div>
        ) : hasCategoryError ? (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            Failed to load categories
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            {isRTL ? "دسته‌بندی‌ای یافت نشد" : "No categories found"}
          </div>
        ) : (
          categories.map((category) => {
            const isActive = activeCategory?.id === category.id;
            const Icon = getIcon(category.slug);

            return (
              <button
                key={category.id}
                onMouseEnter={() => setActiveCategory(category)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-blue-600" : "text-zinc-400"
                    }`}
                  />
                  <span>{getCategoryName(category)}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* --- CONTENT AREA (Subcategories) --- */}
      <div className="flex-1 p-8 bg-white dark:bg-zinc-900 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.div
              key={activeCategory.id}
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                <h3 className="text-xl font-bold">
                  {getCategoryName(activeCategory)}
                </h3>
                <ChevronIcon className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                  {isRTL ? "مشاهده همه محصولات" : "View All Products"}
                </span>
              </div>

              {/* Grid of Children */}
              {activeCategory.subcategories &&
              activeCategory.subcategories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
                  {activeCategory.subcategories.map((sub) => (
                    <a
                      key={sub.id}
                      href={`#category-${sub.slug}`}
                      className="group flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-blue-600 group-hover:w-2 transition-all" />
                      {getCategoryName(sub)}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
                  {isRTL ? "زیرمجموعه‌ای یافت نشد" : "No subcategories found"}
                </div>
              )}

              {/* Optional: Featured Image for this category */}
              <div className="mt-8 p-4 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    {isRTL ? "پیشنهاد ویژه" : "Featured Collection"}
                  </span>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {isRTL
                      ? `پرفروش‌ترین‌های ${getCategoryName(activeCategory)}`
                      : `Best selling ${getCategoryName(activeCategory)}`}
                  </span>
                </div>
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-lg shadow-sm flex items-center justify-center">
                  {React.createElement(getIcon(activeCategory.slug), {
                    className: "w-8 h-8 text-blue-500",
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
