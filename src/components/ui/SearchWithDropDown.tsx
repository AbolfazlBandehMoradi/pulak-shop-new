import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
interface SearchBarProps {
  onFocus?: () => void;
}
export const SearchBar: React.FC<SearchBarProps> = ({ onFocus }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };
  const handleClose = () => setIsFocused(false);
  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFocused]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 max-w-2xl relative transition-all duration-300 ${
        isFocused ? "z-50" : ""
      }`}
    >
      {/* Input */}
      <div
        className={`relative flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-t-2xl ${
          !isFocused && "rounded-b-2xl"
        } border border-transparent ${
          isFocused ? "bg-white dark:bg-zinc-900 shadow-none" : ""
        }`}
      >
        <Search className="w-5 h-5 text-gray-400 absolute start-4 pointer-events-none" />
        <input
          type="text"
          placeholder={t("nav.search") || "Search for products..."}
          onFocus={handleFocus}
          className="w-full h-12 bg-transparent border-none focus:ring-0 ps-12 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
        />
      </div>

      {/* Dropdown */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full start-0 end-0 bg-white dark:bg-zinc-900 rounded-b-3xl shadow-2xl border-x border-b border-zinc-100 dark:border-zinc-800 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col gap-6">
              {/* Recent Results */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("nav.recentSearches")}
                  </span>
                </div>
                <div className="space-y-1">
                  {["iPhone 14 Pro", "Macbook M2", "Samsung S24"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="group-hover:text-blue-600 transition-colors">
                            {item}
                          </span>
                        </div>
                        <ChevronIcon className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Trending Tags */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("nav.trendingNow")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#Gaming_Laptop",
                    "#Headphones",
                    "#SmartWatch",
                    "#Sneakers",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-sm font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
