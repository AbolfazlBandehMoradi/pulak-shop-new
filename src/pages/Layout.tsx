import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Footer } from '@/components/layout/footer/Footer';
import useCart from '@/hooks/cart/useCart';
import { NavbarWithDrawer } from '@/components/layout/navbar/NavbarWithDrawer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav/MobileBottomNav';
import { ReactNode, useEffect } from 'react';
import { useLangStore } from '@/stores/languageStore';
import { isSupportedLang, stripLangPrefix } from '@/utils/langRouting';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  useCart();
  const basePath = stripLangPrefix(location.pathname);
  const isCheckoutOrPaymentPage = basePath === '/checkout' || basePath === '/payment';
  const isProductDetailPage = /^\/products\/[^/]+$/.test(basePath);
  const hideNavAndFooter = basePath === '/auth';
  // const hideNavAndFooter = basePath === '/auth' || isCheckoutOrPaymentPage;
  const showMobileBottomNav = !hideNavAndFooter && !isProductDetailPage;
  const shouldReserveBottomSpace = showMobileBottomNav || isProductDetailPage;

  useEffect(() => {
    const pathLang = location.pathname.split('/').filter(Boolean)[0];
    if (isSupportedLang(pathLang) && pathLang !== lang) {
      setLang(pathLang);
    }
  }, [lang, location.pathname, setLang]);

  return (
    <>
      {!hideNavAndFooter && <NavbarWithDrawer />}
      <div className={shouldReserveBottomSpace ? 'pb-28 lg:pb-0' : undefined}>
        {children ?? <Outlet />}
      </div>
      {/* <GoftinoWidget /> */}
      {!hideNavAndFooter && <Footer />}
      {showMobileBottomNav && <MobileBottomNav />}
      <ScrollRestoration />
    </>
  );
};

export default Layout;
