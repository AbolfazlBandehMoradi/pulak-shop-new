import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Zap, Timer } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import { DiscountProductCard } from "./DiscountProductCard";

// --- Helper: Countdown Timer Component ---
const CountdownBox: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => (
  <div className="flex flex-col items-center">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-rose-100 dark:border-rose-900/30 flex items-center justify-center">
      <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
    <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-1 font-medium uppercase tracking-wider">
      {label}
    </span>
  </div>
);

// --- Main Component ---
interface DiscountProductsProps {
  products?: Product[];
  loading?: boolean;
}

export const DiscountProducts: React.FC<DiscountProductsProps> = ({
  products = [],
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Filter products with discount
  const discountProducts = loading
    ? []
    : products.filter((p) => p.discount && p.discount > 0).slice(0, 4);

  // Mock Countdown Logic
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-rose-50/50 to-white dark:from-rose-950/10 dark:to-zinc-950">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- Header Section --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
          {/* Title & Icon */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {t("products.discount") ||
                  (isRTL ? "پیشنـهادهای شگفت‌انگیز" : "Flash Deals")}
              </h2>
              <p className="text-sm text-rose-600/80 dark:text-rose-400/80 font-medium mt-1">
                {isRTL
                  ? "فرصت محدود تا پایان تخفیف‌ها"
                  : "Limited time offer. Hurry up!"}
              </p>
            </div>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="hidden sm:flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-sm me-2">
              <Timer className="w-4 h-4" />
              <span>{isRTL ? "زمان باقیمانده:" : "Ending in:"}</span>
            </div>
            <CountdownBox value={timeLeft.hours} label="Hrs" />
            <span className="text-rose-300 font-bold text-xl mt-[-15px]">
              :
            </span>
            <CountdownBox value={timeLeft.minutes} label="Mins" />
            <span className="text-rose-300 font-bold text-xl mt-[-15px]">
              :
            </span>
            <CountdownBox value={timeLeft.seconds} label="Secs" />
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <Button
              variant="ghost"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/30 gap-2"
            >
              {t("product.viewAll") || (isRTL ? "مشاهده همه" : "View All")}
              <ArrowIcon className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* --- Product Grid --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading
            ? // Show skeleton loaders
            [...Array(4)].map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))
            : discountProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5 },
                  },
                }}
              >
                <DiscountProductCard product={product} />
              </motion.div>
            ))}
        </motion.div>

        {/* Mobile View All (Bottom) */}
        <div className="mt-8 text-center lg:hidden">
          <Button
            variant="outline"
            className="w-full justify-center border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            {t("product.viewAll") ||
              (isRTL ? "مشاهده همه پیشنهادها" : "View All Deals")}
          </Button>
        </div>
      </div>
    </section>
  );
};
