import React from "react";
import { Globe } from "lucide-react";
import { useLangStore } from "@/stores/languageStore";
import { useLocation, useNavigate } from "react-router-dom";
import { replacePathLanguage } from "@/utils/langRouting";

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useLangStore();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLang = () => {
    const nextLang = lang === "fa" ? "en" : "fa";
    setLang(nextLang);
    navigate(
      replacePathLanguage(
        `${location.pathname}${location.search}${location.hash}`,
        nextLang,
      ),
      { replace: true },
    );
  };

  return (
    <button
      onClick={toggleLang}
      className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative group"
      title={lang === "fa" ? "Switch to English" : "تغییر به فارسی"}
      aria-label={lang === "fa" ? "Switch to English" : "Switch to Persian"}
    >
      <Globe className="w-5 h-5" />
      <span className="text-[10px] font-bold absolute -bottom-1 left-1/2 -translate-x-1/2">
        {lang === "fa" ? "EN" : "FA"}
      </span>
    </button>
  );
};
