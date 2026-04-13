import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShopStore } from "@/stores/productsFilterStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLocation, useNavigate } from "react-router-dom";
import { useLangStore } from "@/stores/languageStore";
import { stripLangPrefix } from "@/utils/langRouting";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface Props {
  onFocus: () => void;
  onBlur: () => void;
}

export const SearchWithButton = ({ onFocus, onBlur }: Props) => {
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const location = useLocation();
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  const { search, setSearch } = useShopStore();

  const isProductsPage = stripLangPrefix(location.pathname) === "/products";

  // Input state
  const [input, setInput] = useState(search ?? "");

  // Debounced value
  const debouncedInput = useDebouncedValue(input, 300);
  useEffect(() => {
  if (!isProductsPage) return;

  const normalized = debouncedInput.trim() || undefined;
  setSearch(normalized);
}, [debouncedInput, isProductsPage, setSearch]);

  /**
   * STORE → INPUT (single source of truth)
   */
/**
 * STORE → INPUT (sync only)
 */
useEffect(() => {
  if (!isProductsPage) {
    setInput("");
    return;
  }

  setInput(search ?? "");
}, [isProductsPage, search]);




  /**
   * Submit behavior:
   * - Outside /products → navigate
   * - Inside /products → debounce already handled it
   */
  const handleSubmit = () => {
    const normalized = input.trim() || undefined;

    if (!isProductsPage) {
      setSearch(normalized);

      navigate(
        normalized
          ? localizedPath(`/products?search=${encodeURIComponent(normalized)}`)
          : localizedPath("/products")
      );
    }

    onBlur();
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      onFocusCapture={onFocus}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onBlur();
        }
      }}
      className={`flex w-full ${
        lang === "fa" ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <label htmlFor="search-input" className="sr-only">
        {t("nav.search")}
      </label>

      <input
        id="search-input"
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("nav.search") || "Search for products"}
        className="h-12 px-4 w-full border border-gray-500 text-sm rounded-r-xl focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      <button
        type="submit"
        aria-label={t("nav.search")}
        className="h-12 px-4 rounded-l-xl bg-first hover:bg-first-700 text-white flex items-center justify-center"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
};
