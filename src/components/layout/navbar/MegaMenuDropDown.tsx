import { MegaMenu } from "./MegaMenu";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { t } from "i18next";
import { Menu } from "lucide-react";
import { useState } from "react";

function MegaMenuDropDown() {
  const { scrollY } = useScroll();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hideBottomBar, setHideBottomBar] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = latest - previous;
    if (Math.abs(diff) < 10) return;
    if (latest > 100 && diff > 0) {
      setHideBottomBar(true);
      setIsMegaMenuOpen(false);
    } else if (diff < 0) {
      setHideBottomBar(false);
    }
  });
  return (
    <>
      <motion.div
        className="bg-slate-900 text-white overflow-hidden relative z-40"
        initial={false}
        animate={{
          height: hideBottomBar ? 0 : "auto",
          opacity: hideBottomBar ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between h-12">
          {/* Categories & Links */}
          <div className="flex items-center gap-6">
            {/* TRIGGER AREA */}
            <div
              className="h-12 flex items-center cursor-pointer"
              onMouseEnter={() => !hideBottomBar && setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
              onClick={() =>
                !hideBottomBar && setIsMegaMenuOpen(!isMegaMenuOpen)
              }
            >
              <button
                className={`flex items-center gap-2 text-sm font-bold transition-colors py-2 ${
                  isMegaMenuOpen ? "text-blue-400" : "hover:text-blue-400"
                }`}
              >
                <Menu className="w-5 h-5" />
                <span>{t("nav.allCategories")}</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              {[
                { key: "AboutUs", translation: t("nav.AboutUs") },
                { key: "ContactUs", translation: t("nav.ContactUs") },
                { key: "blog", translation: t("nav.blog") },
              ].map((item) => (
                <a
                  key={item.key}
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {item.translation}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isMegaMenuOpen && !hideBottomBar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[128px] inset-x-0 z-30" // Fixed top position below the header
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <MegaMenu />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MegaMenuDropDown;
