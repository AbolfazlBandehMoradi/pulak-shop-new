import { createBrowserRouter, Navigate, type LoaderFunction, useLocation } from "react-router-dom";
import ProfilePage from './pages/auth/ProfilePage';
import Cart from './pages/cart/Cart';
import MainPage from './pages/landing/MainPage';
import PrivateRoutes from './pages/PrivateRoutes';
import Layout from './pages/Layout';
import Faq from './pages/Static/faq/Faq';
import AboutUs from './pages/Static/AboutUs/AboutUs';
import ContactUs from './pages/Static/ContactUs/ContactUs';
import ReturnPolicy from './pages/Static/ReturnPolicy/ReturnPolicy';
import ProductDetail from './pages/shop/Product-Detail/ProductDetail';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CategoriesPage from './pages/shop/Categories/CategoriesPage';
import ProductsFilterPage from './pages/shop/Products/ProductsFilterPage';
import ErrorPage from './pages/error/ErrorPage';
import BlogListPage from './pages/blog/BlogListPage';
import BlogPage from './pages/blog/BlogPage';
import PaymentPage from './pages/checkout/PaymentPage';
import Auth from './pages/auth/Auth';
import PaymentFailurePage from './pages/checkout/PaymentFailurePage';
import PaymentSuccessPage from './pages/checkout/PaymentSuccessPage';
import { useLangStore } from "@/stores/languageStore";
import { SUPPORTED_LANGS, SupportedLang, withLangPath } from "@/utils/langRouting";

function RedirectToPreferredLanguage() {
  const lang = useLangStore((s) => s.lang);
  return <Navigate to={`/${lang}`} replace />;
}

function RedirectToLocalizedPath() {
  const location = useLocation();
  const lang = useLangStore((s) => s.lang);
  const destination = withLangPath(
    `${location.pathname}${location.search}${location.hash}`,
    lang,
  );

  return <Navigate to={destination} replace />;
}

const getPublicChildren = () => [
  { index: true, element: <MainPage /> },
  { path: "auth", element: <Auth /> },
  { path: "categories", element: <CategoriesPage /> },
  { path: "products", element: <ProductsFilterPage /> },
  { path: "products/:slug", element: <ProductDetail /> },
  { path: "blogs", element: <BlogListPage /> },
  { path: "blogs/:slug", element: <BlogPage /> },
  { path: "cart", element: <Cart /> },
  { path: "faq", element: <Faq /> },
  { path: "about-us", element: <AboutUs /> },
  { path: "contact-us", element: <ContactUs /> },
  { path: "return-policy", element: <ReturnPolicy /> }
];

const getPrivateChildren = () => [
  { path: "checkout", element: <CheckoutPage /> },
  { path: "payment", element: <PaymentPage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "payment/success", element: <PaymentSuccessPage /> },
  { path: "payment/failure", element: <PaymentFailurePage /> },
];

function LayoutErrorBoundary() {
  return (
    <Layout>
      <ErrorPage />
    </Layout>
  );
}

const notFoundLoader: LoaderFunction = () => {
  throw new Response("Not Found", { status: 404 });
};

function createLocalizedBranch(lang: SupportedLang) {
  return {
    path: `/${lang}`,
    element: <Layout />,
    errorElement: <LayoutErrorBoundary />,
    children: [
      ...getPublicChildren(),
      {
        element: <PrivateRoutes />,
        children: getPrivateChildren(),
      },
      {
        path: "*",
        loader: notFoundLoader,
        errorElement: <ErrorPage />,
      },
    ],
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToPreferredLanguage />,
  },
  ...SUPPORTED_LANGS.map(createLocalizedBranch),
  {
    path: "*",
    element: <RedirectToLocalizedPath />,
  },
]);
