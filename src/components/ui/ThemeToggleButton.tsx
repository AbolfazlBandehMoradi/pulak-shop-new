import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";

export const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { t } = useTranslation();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title={t("common.toggleTheme")}
      aria-label={t("common.toggleTheme")}
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
