import { useState } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import MainLogo from "@/assets/Images/Logo/MainLogo.png";
import BasketWithNumber from "@/components/layout/navbar/BasketWithNumber";
import { SearchWithButton } from "@/components/ui/SearchWithButton";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";
import { LanguageToggle } from "./LanguageWithClick";
import { MobileDrawer } from "./MobileDrawer";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const dir = useLangStore(s => s.dir)
  const localizedPath = useLocalizedPath();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const openSearch = () => setIsSearchFocused(true);
  const closeSearch = () => setIsSearchFocused(false);

  return (
    <div dir={dir} className="relative z-50 h-20 w-full">
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            aria-hidden
            className="fixed inset-0 z-40 bg-color-for-layer-on-body/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <nav
        aria-label="Main navigation"
        className="fixed left-0 right-0 top-0 z-50 flex w-full bg-color-for-layer-on-body p-4 backdrop-blur-xl"
      >
        <div className="relative mx-auto w-full sm:container">
          <div className="flex items-center w-full flex-row-reverse lg:flex-row justify-between">
            <div className="lg:flex hidden items-center gap-3">
              <Link to={localizedPath("/")} aria-label="Go to homepage">
                <img
                  src={MainLogo}
                  alt="GammaTebAsia logo"
                  className="h-12 w-12"
                />
              </Link>
              <div className="hidden lg:flex" >
                <SearchWithButton onFocus={openSearch} onBlur={closeSearch} />
              </div>
            </div>
            <ul className="hidden lg:flex gap-4">
              <li>
                <Link
                  to={localizedPath("/")}
                  className="font-s-light first-text-color hover:text-first hover:font-s-medium transition-colors duration-300"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/products")} className="font-s-light first-text-color hover:text-first hover:font-s-medium transition-colors duration-300">
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/about-us")} className="font-s-light first-text-color hover:text-first hover:font-s-medium transition-colors duration-300">
                  {t("nav.AboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  to={localizedPath("/contact-us")}
                  className="font-s-light first-text-color hover:text-first hover:font-s-medium transition-colors duration-300"
                >
                  {t("nav.ContactUs")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/blogs")} className="font-s-light first-text-color hover:text-first hover:font-s-medium transition-colors duration-300">
                  {t("nav.blog")}
                </Link>
              </li>
            </ul>
            <div className="hidden lg:flex items-center gap-2">
              <div className=" flex gap-2">
                <Link
                  to={localizedPath(isAuthenticated ? "/profile" : "/auth")}
                  className="group flex items-center gap-2 rounded-xl border border-gray-400 px-4 py-2.5 
             hover:bg-first hover:text-white dark:border-gray-500 
             transition-colors duration-300"
                >
                  <User className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-white" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-white">
                    {user?.username || t("nav.login")}
                  </span>
                </Link>
                <LanguageToggle />
                <ThemeToggleButton />
                <BasketWithNumber />
              </div>
              {isAuthenticated && (
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="rounded-lg px-3 py-2 text-sm hover:bg-first-100"
                >
                  <LogOut className="h-4 w-4 text-first" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap w-full lg:hidden">
              <div className="flex w-full mb-4 justify-between">
                <div className="flex  items-center">
                  <button
                    onClick={openDrawer}
                    aria-label="Open menu"
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Menu className="w-8 h-8 text-first" />
                  </button>
                </div>
                <Link
                  to={localizedPath(isAuthenticated ? "/profile" : "/auth")}
                  className="flex items-center gap-2 rounded-xl border border-gray-400 px-4 py-2.5 hover:bg-color-for-layer-on-body dark:border-gray-500"
                >
                  <User className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user?.username || t("nav.login")}
                  </span>
                </Link>
                <div className="flex">
                  {isAuthenticated && (
                    <button
                      onClick={logout}
                      aria-label="Log out"
                      className="rounded-lg px-3 py-2 text-sm hover:bg-first-100"
                    >
                      <LogOut className="h-4 w-4 text-first" />
                    </button>
                  )}
                  <LanguageToggle />
                  <ThemeToggleButton />
                  <BasketWithNumber />
                </div>
              </div>
              <div className="flex w-full" >
                <SearchWithButton onFocus={openSearch} onBlur={closeSearch} />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <MobileDrawer
        isOpen={isDrawerOpen}
        close={closeDrawer}
        isAuthenticated={isAuthenticated}
        user={user ?? undefined}
        logout={logout}
        MainLogo={MainLogo}
        t={t}
      />
    </div>
  );
};
