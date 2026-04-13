import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Timer } from "lucide-react";
import { Product } from "@/types";
import { DiscountProductCard } from "./DiscountProductCard";
import bgForDiscount from "@/assets/Images/static/Background/bg-for-discount.png";
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
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "fa";

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
    <section
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgForDiscount})` }}
    >
      <div className="sm:container mx-auto py-16 my-8 px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10">
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
            <span className="text-rose-300 font-bold text-xl -mt-4">
              :
            </span>
            <CountdownBox value={timeLeft.minutes} label="Mins" />
            <span className="text-rose-300 font-bold text-xl -mt-4">
              :
            </span>
            <CountdownBox value={timeLeft.seconds} label="Secs" />
          </motion.div>
        </div>
        <div >
          {discountProducts.map((product) => (
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
              initial="hidden"
              animate="visible"
            >
              <DiscountProductCard
                product={product}
                onLinkHover={() => { }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
