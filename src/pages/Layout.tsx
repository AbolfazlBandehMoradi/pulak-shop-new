import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/footer/Footer";
import useCart from "@/hooks/cart/useCart";
import { Navbar } from "@/components/layout/navbar/Navbar";
import GoftinoWidget from "@/components/ui/GoftinoWidget";
import { ReactNode, useEffect } from "react";
import { useLangStore } from "@/stores/languageStore";
import { isSupportedLang, stripLangPrefix } from "@/utils/langRouting";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  useCart();
  const basePath = stripLangPrefix(location.pathname);
  const hideNavAndFooter = basePath === "/auth";

  useEffect(() => {
    const pathLang = location.pathname.split("/").filter(Boolean)[0];
    if (isSupportedLang(pathLang) && pathLang !== lang) {
      setLang(pathLang);
    }
  }, [lang, location.pathname, setLang]);

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      {children ?? <Outlet />}
      <GoftinoWidget />
      {!hideNavAndFooter && <Footer />}
      <ScrollRestoration />
    </>
  );
};

export default Layout;
