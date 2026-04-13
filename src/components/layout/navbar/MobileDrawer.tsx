import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface Props {
  isOpen: boolean;
  close: () => void;
  isAuthenticated: boolean;
  user?: { username?: string };
  logout: () => void;
  t: (key: string) => string;
  MainLogo: string;  // اضافه کردن prop برای لوگو
}

export const MobileDrawer: React.FC<Props> = ({
  isOpen,
  close,
  t,
  MainLogo
}) => {
  const isRTL = useLangStore(s => s.dir) == "rtl";
  const localizedPath = useLocalizedPath();

  const fromX = isRTL ? "100%" : "-100%";
  const sideClass = isRTL ? "right-0" : "left-0";

  // 👇 Force-close on desktop
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const handleChange = () => {
      if (media.matches) close();
    };

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [close]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: fromX }}
            animate={{ x: 0 }}
            exit={{ x: fromX }}
            transition={{ type: "tween", duration: 0.25 }}
            className={`fixed top-0 ${sideClass} bottom-0 z-50 w-64 sm:w-72 
              bg-white dark:bg-gray-900 p-6 shadow-lg flex flex-col gap-4 lg:hidden`}
          >
            <div className="flex justify-between">
              <Link to={localizedPath("/")} aria-label="Go to homepage">
                <img
                  src={MainLogo}
                  alt="GammaTebAsia logo"
                  className="h-12 w-12"
                />
              </Link>
              <button
                onClick={close}
                className=""
              >
                ✕
              </button>
            </div>

            {/* Links */}
            <ul className="flex flex-col gap-3">
              <li>
                <Link to={localizedPath("/")} onClick={close}>
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/products")} onClick={close}>
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/about-us")} onClick={close}>
                  {t("nav.AboutUs")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/contact-us")} onClick={close}>
                  {t("nav.ContactUs")}
                </Link>
              </li>
              <li>
                <Link to={localizedPath("/blogs")} onClick={close}>
                  {t("nav.blog")}
                </Link>
              </li>
            </ul>
            {/* <div className="mt-auto flex flex-col gap-3">
              <Link
                to={isAuthenticated ? "/profile" : "/auth"}
                onClick={close}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border"
              >
                <User className="w-5 h-5" />
                {user?.username || t("nav.login")}
              </Link>

              <ThemeToggleButton />
              <LanguageToggle />
              <BasketWithNumber />

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    close();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav.logout")}
                </button>
              )}
            </div> */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
