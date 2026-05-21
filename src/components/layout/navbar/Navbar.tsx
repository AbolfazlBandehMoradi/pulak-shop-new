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

type CategoryId = string | null;

export const Navbar: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { data: categories } = useCategories();
  const dir = useLangStore((s) => s.dir);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isDesktopCategoryOpen, setIsDesktopCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<CategoryId>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const desktopCategoryRef = useRef<HTMLLIElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  const setSearchText = useShopStore((s) => s.setSearch);
  const setCategoryIds = useShopStore((s) => s.setCategoryIds);
  const cartCount = useCartStore((s) => s.itemCount);

  const isFa = i18n.language === 'fa';
  const searchPlaceholder = isFa ? 'جستجوی محصولات...' : 'Search products...';

  const navLabels = {
    home: isFa ? 'پولک' : 'Pulak',
    categories: isFa ? 'دسته بندی' : 'Categories',
    about: isFa ? 'درباره ما' : 'About us',
    contact: isFa ? 'تماس با ما' : 'Contact us',
    blog: isFa ? 'بلاگ' : 'Blog',
    signIn: isFa ? 'ورود و ثبت نام' : 'Sign in / Register',
    signInShort: isFa ? 'ورود' : 'Sign in',
    all: isFa ? 'مشاهده همه' : 'View all',
    profile: isFa ? 'پروفایل' : 'Profile',
    cart: isFa ? 'سبد خرید' : 'Cart',
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsDrawerOpen(false);
      setIsMobileCategoryOpen(false);
      setOpenSubMenu(null);
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

      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(target)) {
        setIsDrawerOpen(false);
      }

      if (isProfileMenuOpen && profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isDesktopCategoryOpen, isDrawerOpen, isProfileMenuOpen]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsMobileCategoryOpen(false);
    setOpenSubMenu(null);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    closeDrawer();
    logout();
    navigate(localizedPath('/'));
  };

  return (
    <nav className="navbar-shell">
      {!isMobile && (
        <div dir={dir} className="container mx-auto my-4 px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full items-center gap-3 lg:w-8/12">
              <Link className="hidden w-16 md:block" to={localizedPath('/')}>
                <img className="w-full h-auto" src={MainLogo} alt="logo" />
              </Link>

              <form
                className="flex w-full nav-search-form"
                name="search"
                onSubmit={handleSearchSubmit}
              >
                <input
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
                    {user?.avatar?.filePath ? (
                      <img
                        src={user.avatar.filePath}
                        alt={user?.firstName || navLabels.profile}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-8 w-8 rounded-full bg-color-for-layer-sec" />
                    )}
                    <span className="text-sm">{user?.firstName || navLabels.profile}</span>
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
                        <Link
                          to={localizedPath('/cart')}
                          className="block rounded-lg px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          {navLabels.cart}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="block w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('shared.nav.logout')}
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

      <div className="mx-auto bg-color-for-layer-on-body p-4">
        {!isMobile ? (
          <div className="container mx-auto flex items-center justify-between px-4">
            <ul className="flex items-center gap-8">
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
                  <div className="absolute start-0 top-full z-40 mt-3 w-212.5 overflow-hidden rounded-2xl bg-color-for-layer-on-body shadow-dark-sm">
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
          <div className="container mx-auto px-1 pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl">
                <button
                  aria-label="Open menu"
                  className="rounded-xl border border-gray-300/50 p-2 first-text-color-svg"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 17H20M4 12H20M4 7H20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <Link to={localizedPath('/')} className="block w-20">
                  <img className="h-24" src={logoNav} alt="logo" />
                </Link>

                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggleButton />

                  <Link
                    className="relative rounded-xl border border-gray-300/50 p-2 first-text-color-svg"
                    to={localizedPath('/cart')}
                    aria-label={navLabels.cart}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4.78571 5H18.2251C19.5903 5 20.5542 6.33739 20.1225 7.63246L18.4558 12.6325C18.1836 13.4491 17.4193 14 16.5585 14H6.07142M4.78571 5L4.74531 4.71716C4.60455 3.73186 3.76071 3 2.76541 3H2M4.78571 5L6.07142 14M6.07142 14L6.25469 15.2828C6.39545 16.2681 7.23929 17 8.23459 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-secound px-1 text-center text-[11px] leading-5 text-white">
                      {cartCount}
                    </span>
                  </Link>

                  {!isAuthenticated ? (
                    <Link
                      to={localizedPath('/auth')}
                      className="rounded-xl bg-first py-2 px-3 text-[16px] font-s-sbold text-white"
                    >
                      {navLabels.signInShort}
                    </Link>
                  ) : (
                    <Link
                      to={localizedPath('/profile')}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-300/50 bg-color-for-layer-on-body"
                      aria-label={navLabels.profile}
                    >
                      {user?.avatar?.filePath ? (
                        <img
                          src={user.avatar.filePath}
                          alt={user?.firstName || navLabels.profile}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="h-3 w-3 rounded-full bg-first" />
                      )}
                    </Link>
                  )}
                </div>
              </div>

              <form
                className="flex w-full nav-search-form"
                name="mobile-search"
                onSubmit={handleSearchSubmit}
              >
                <input
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

            {isDrawerOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]"
                onClick={closeDrawer}
              />
            )}

            <div
              ref={drawerRef}
              className={`fixed top-0 z-60 h-full w-10/12 max-w-sm overflow-y-auto bg-color-for-layer-on-body shadow-dark-sm transition-transform duration-300 ${
                dir === 'rtl' ? 'right-0' : 'left-0'
              } ${isDrawerOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'}`}
            >
              <div className="flex items-center justify-between border-b border-gray-200/50 p-4">
                <button
                  onClick={closeDrawer}
                  className="rounded-xl border border-gray-300/60 p-2 first-text-color-svg"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 5L5 19M5.00003 5L19 19"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <Link to={localizedPath('/')} className="w-22" onClick={closeDrawer}>
                  <img className="w-5/6" src={MainLogo} alt="logo" />
                </Link>
              </div>

              <ul className="space-y-2 p-4">
                <li className="rounded-xl bg-color-for-layer-sec p-3">
                  <button
                    onClick={() => setIsMobileCategoryOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-sm font-f-sbold first-text-color"
                  >
                    <span>{navLabels.categories}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${isMobileCategoryOpen ? 'rotate-180' : ''}`}
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

                  {isMobileCategoryOpen && (
                    <ul className="mt-3 space-y-2">
                      {categories?.map((menu) => (
                        <li key={menu.id} className="rounded-lg bg-color-for-layer-on-body p-2">
                          <button
                            onClick={() =>
                              setOpenSubMenu((prev) => (prev === menu.id ? null : menu.id))
                            }
                            className={`flex w-full items-center justify-between text-sm first-text-color ${
                              dir === 'rtl' ? 'text-right' : 'text-left'
                            }`}
                          >
                            <span>{menu.name}</span>
                            <svg
                              className={`h-4 w-4 transition-transform ${openSubMenu === menu.id ? 'rotate-180' : ''}`}
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

                          {openSubMenu === menu.id && (
                            <ul className="mt-2 space-y-1 px-2">
                              {menu.children?.map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    className="block py-1 text-sm first-text-color-for-paragraph hover:first-text-color"
                                    onClick={() => {
                                      setCategoryIds([sub.id]);
                                      closeDrawer();
                                    }}
                                    to={categoryHref(sub.id)}
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                              <li>
                                <Link
                                  className="my-2 inline-flex rounded-lg bg-secound px-3 py-2 text-xs text-white"
                                  onClick={closeDrawer}
                                  to={categoryHref(menu.id)}
                                >
                                  {navLabels.all}
                                </Link>
                              </li>
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                <li>
                  <Link
                    className="block rounded-xl px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                    onClick={closeDrawer}
                    to={localizedPath('/about-us')}
                  >
                    {navLabels.about}
                  </Link>
                </li>
                <li>
                  <Link
                    className="block rounded-xl px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                    onClick={closeDrawer}
                    to={localizedPath('/contact-us')}
                  >
                    {navLabels.contact}
                  </Link>
                </li>
                <li>
                  <Link
                    className="block rounded-xl px-3 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                    onClick={closeDrawer}
                    to={localizedPath('/blogs')}
                  >
                    {navLabels.blog}
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      {t('shared.nav.logout')}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
