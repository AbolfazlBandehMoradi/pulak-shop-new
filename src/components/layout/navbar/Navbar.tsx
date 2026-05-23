import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainLogo from '@/assets/Images/Logo/MainLogo.png';
import logoNav from '@/assets/Images/Logo/logo-nav.png';
import { useAuth } from '@/context/AuthContext';
import useCartStore from '@/stores/cartStore';
import { useShopStore } from '@/stores/productsFilterStore';
import { useLangStore } from '@/stores/languageStore';
import useCategories from '@/hooks/useCategories';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageWithClick';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import { EllipsisVertical, User2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { data: categories } = useCategories();
  const dir = useLangStore((s) => s.dir);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const desktopCategoryRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  const setSearchText = useShopStore((s) => s.setSearch);
  const setCategoryIds = useShopStore((s) => s.setCategoryIds);
  const cartCount = useCartStore((s) => s.itemCount);

  const searchPlaceholder = t('nav.searchPlaceholder') || t('nav.search');

  const navLabels = {
    home: t('nav.home'),
    categories: t('nav.categories'),
    about: t('nav.about'),
    contact: t('nav.contact'),
    blog: t('nav.blog'),
    signIn: t('nav.login'),
    signInShort: t('nav.loginShort'),
    all: t('nav.all'),
    profile: t('nav.profile'),
    cart: t('nav.cart'),
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isDesktopCategoryOpen &&
        desktopCategoryRef.current &&
        !desktopCategoryRef.current.contains(target)
      ) {
        setIsDesktopCategoryOpen(false);
      }

      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }

      if (isProfileMenuOpen && profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isDesktopCategoryOpen, isMobileMenuOpen, isProfileMenuOpen]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    const normalizedSearch = searchRef.current?.value?.trim() || undefined;
    setSearchText(normalizedSearch);

    const query = new URLSearchParams();
    if (normalizedSearch) query.set('search', normalizedSearch);

    const target = query.toString()
      ? localizedPath(`/products?${query.toString()}`)
      : localizedPath('/products');

    navigate(target);
  };

  const categoryHref = (id: string) => localizedPath(`/products?categoryIds=${id}`);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate(localizedPath('/'));
  };

  return (
    <nav className="navbar-shell my-4">
      {!isMobile && (
        <div dir={dir} className="sm:container mx-auto  px-4 ">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full items-center gap-3 lg:w-8/12">
              <Link className="hidden w-16 md:block" to={localizedPath('/')}>
                <img className="w-full h-auto" src={MainLogo} alt="logo" />
              </Link>
              <form
                className="flex w-full h-14 overflow-hidden rounded-2xl bg-color-for-layer-on-body  "
                name="search"
                onSubmit={handleSearchSubmit}
              >
                <input
                  dir={dir}
                  ref={searchRef}
                  name="search"
                  type="search"
                  className="w-full border-0   first-text-color-for-paragraph px-4 no-clear-button"
                  placeholder={searchPlaceholder}
                  onChange={() => {
                    if (searchRef.current?.value) {
                      setSearchText(searchRef.current.value);
                    } else {
                      setSearchText(undefined);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="w-8/96 hover:bg-first hover:text-white flex items-center border-r border-gray-300 dark:border-gray-500  justify-center group"
                  aria-label={searchPlaceholder}
                >
                  <svg
                    className="group-hover:text-white first-text-color-svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20 20L15.8033 15.8033M18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C14.6421 18 18 14.6421 18 10.5Z"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>

            <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
              <LanguageToggle />
              <ThemeToggleButton />

              {!isAuthenticated ? (
                <Link
                  to={localizedPath('/auth')}
                  className={`font-s-sbold first-text-color flex h-12
                   items-center justify-center gap-2 rounded-2xl bg-color-for-layer-on-body px-4`}
                >
                  <span>{navLabels.signIn}</span>
                </Link>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex h-12 items-center gap-2 rounded-xl bg-color-for-layer-on-body px-3 first-text-color"
                  >
                    <User2 className="text-first" />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full z-50 mt-2 min-w-44 rounded-xl bg-color-for-layer-on-body p-2 shadow-dark-sm"
                      >
                        <Link
                          to={localizedPath('/profile')}
                          className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          {navLabels.profile}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link
                className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-first"
                to={localizedPath('/cart')}
                aria-label={navLabels.cart}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4.78571 5H18.2251C19.5903 5 20.5542 6.33739 20.1225 7.63246L18.4558 12.6325C18.1836 13.4491 17.4193 14 16.5585 14H6.07142M4.78571 5L4.74531 4.71716C4.60455 3.73186 3.76071 3 2.76541 3H2M4.78571 5L6.07142 14M6.07142 14L6.25469 15.2828C6.39545 16.2681 7.23929 17 8.23459 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full text-white bg-secound px-1 text-center text-[11px] leading-5">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto bg-color-for-layer-on-body mt-4 p-4">
        {!isMobile ? (
          <div
            dir={dir}
            className="container mx-auto max-w-7xl flex items-center justify-between px-4"
          >
            <ul className="flex items-center gap-4">
              <li className="text-base font-f-normal first-text-color">
                <Link to={localizedPath('/')} className="first-header__ul-link">
                  {navLabels.home}
                </Link>
              </li>

              <li
                ref={desktopCategoryRef}
                className="relative text-base font-f-normal first-text-color"
              >
                <button
                  className="flex items-center gap-2"
                  onClick={() => setIsDesktopCategoryOpen((prev) => !prev)}
                >
                  <span>{navLabels.categories}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isDesktopCategoryOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isDesktopCategoryOpen && (
                  <div
                    className={`absolute ${dir == 'rtl' ? ' -right-15' : 'left-15'} border border-gray-300/60 top-full z-40 mt-3 w-212.5 overflow-hidden rounded-2xl bg-color-for-layer-on-body shadow-dark-sm`}
                  >
                    <div className="flex">
                      <ul className="w-64 border-e border-gray-300/60 bg-color-for-layer-sec p-4">
                        {categories?.map((category, index) => (
                          <li key={category.id}>
                            <button
                              className={`mb-2 flex w-full items-center rounded-lg px-3 py-2 text-sm text-start ${
                                activeTab === index
                                  ? 'bg-color-for-layer-on-body font-f-sbold'
                                  : 'font-f-light'
                              }`}
                              onMouseEnter={() => setActiveTab(index)}
                              onFocus={() => setActiveTab(index)}
                            >
                              {category.name}
                            </button>
                          </li>
                        ))}
                      </ul>

                      <div className="flex-1 p-5">
                        <h5 className="mb-4 text-base font-f-sbold text-first">
                          {categories?.[activeTab]?.name}
                        </h5>
                        <ul className="grid grid-cols-3 gap-3">
                          {categories?.[activeTab]?.children?.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                                onClick={() => {
                                  setCategoryIds([sub.id]);
                                  setIsDesktopCategoryOpen(false);
                                }}
                                to={categoryHref(sub.id)}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {categories?.[activeTab]?.id && (
                          <div className="mt-4">
                            <Link
                              className="inline-flex rounded-lg bg-secound px-4 py-2 text-sm text-white"
                              to={categoryHref(categories[activeTab].id)}
                              onClick={() => setIsDesktopCategoryOpen(false)}
                            >
                              {navLabels.all}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li className="text-base font-f-normal first-text-color">
                <Link to={localizedPath('/about-us')} className="first-header__ul-link">
                  {navLabels.about}
                </Link>
              </li>
              <li className="text-base font-f-normal first-text-color">
                <Link to={localizedPath('/contact-us')} className="first-header__ul-link">
                  {navLabels.contact}
                </Link>
              </li>
              <li className="text-base font-f-normal first-text-color">
                <Link to={localizedPath('/blogs')} className="first-header__ul-link">
                  {navLabels.blog}
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <div dir={dir} className="mx-auto px-1 pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl">
                <div ref={mobileMenuRef} className="relative">
                  <button
                    type="button"
                    aria-label={t('nav.openMenu')}
                    className="rounded-xl border border-gray-300/50 p-2 first-text-color-svg"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  >
                    <EllipsisVertical className="h-8 w-8" strokeWidth={1.8} />
                  </button>

                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`absolute top-full z-50 mt-2 min-w-48 rounded-xl border border-gray-300/60 bg-color-for-layer-on-body p-2 shadow-dark-sm ${
                          dir === 'rtl' ? 'right-0' : 'left-0'
                        }`}
                      >
                      
                        <Link
                          to={localizedPath('/about-us')}
                          className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {navLabels.about}
                        </Link>
                        <Link
                          to={localizedPath('/contact-us')}
                          className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {navLabels.contact}
                        </Link>
                        <Link
                          to={localizedPath(isAuthenticated ? '/profile' : '/auth')}
                          className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {isAuthenticated ? navLabels.profile : navLabels.signInShort}
                        </Link>
                        {isAuthenticated && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                            onClick={handleLogout}
                          >
                            {t('nav.logout')}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to={localizedPath('/')} className="block w-20">
                  <img className="h-24" src={logoNav} alt="logo" />
                </Link>

                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggleButton />
                </div>
              </div>

              <form
                className="flex w-full nav-search-form"
                name="mobile-search"
                onSubmit={handleSearchSubmit}
              >
                <input
                  dir={dir}
                  ref={searchRef}
                  name="search"
                  type="search"
                  className="nav-search-input no-clear-button"
                  placeholder={searchPlaceholder}
                  onChange={() => {
                    if (searchRef.current?.value) {
                      setSearchText(searchRef.current.value);
                    } else {
                      setSearchText(undefined);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="nav-search-submit group"
                  aria-label={searchPlaceholder}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 20L15.8033 15.8033M18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C14.6421 18 18 14.6421 18 10.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
