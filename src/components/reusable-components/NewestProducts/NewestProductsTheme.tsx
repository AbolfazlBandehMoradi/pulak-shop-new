import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import { ProductCard } from "../DiscountProducts/ProductCard";


interface NewestProductsProps {
  products?: Product[];
  loading?: boolean;
}

export const NewestProducts: React.FC<NewestProductsProps> = ({
  products = [],
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState("all");

  // Build tabs from product categories
  const tabs = useMemo(() => {
    const uniqueCategories = new Map<string, string>();
    products.forEach((p) => {
      if (p.categoryId && p.category) {
        uniqueCategories.set(p.categoryId, p.category);
      }
    });

    const dynamicTabs = Array.from(uniqueCategories.entries()).map(
      ([id, name]) => ({
        id,
        label: name,
        icon: Layers, // Reuse generic icon; could be customized per category later
      })
    );

    return [{ id: "all", label: t("nav.all"), icon: Layers }, ...dynamicTabs];
  }, [products, t]);

  // filter logic (Mocking category filtering based on IDs or adding a logic)
  const filteredProducts = useMemo(() => {
    if (loading || !products.length) return [];
    if (activeTab === "all") {
      return products.slice(0, 8);
    }
    const filtered = products.filter((p) => p.categoryId === activeTab);
    return filtered.slice(0, 8);
  }, [activeTab, products, loading]);

  return (
    <section
      id="newest-products"
      className="py-16 bg-slate-50 dark:bg-zinc-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Header & Tabs --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
          {/* Title */}
          <div className="text-center lg:text-start">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {t("products.newest")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t("products.newestDescription")}
            </p>
          </div>

          {/* Filter Tabs (Scrollable on mobile) */}
          {false && (
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              <div className="flex items-center gap-2 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-300 ${isActive
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-900"
                        }`}
                    >
                      {/* Active Background Animation */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-blue-600 rounded-xl"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Content (z-10 to sit on top of background) */}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {tab.id === "all" ? tab.label : tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading ? (
            [...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-600 dark:hover:border-blue-600 transition-colors min-w-[200px]"
          >
            {t("product.viewAll")}
            <ArrowIcon className="ms-2 w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </section>
  );
};
