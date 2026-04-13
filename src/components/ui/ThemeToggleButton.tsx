import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

export const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
