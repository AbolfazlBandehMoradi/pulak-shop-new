import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import MainLogo from '@/assets/Images/Logo/MainLogo.png';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import { LanguageToggle } from './LanguageWithClick';
import useCartStore from '@/stores/cartStore';
import { useShopStore } from '@/stores/productsFilterStore';
import { useLangStore } from '@/stores/languageStore';
import useCategories from '@/hooks/useCategories';

export const Navbar: React.FC = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const favCounts = 0;
  const { data: categories } = useCategories();
  const [isOpenMegaMenu, setIsOpenMegaMenu] = useState(false);
  const menuRefMegaMenu = useRef<HTMLLIElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [homeMenuOpen, setHomeMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setSearchText = useShopStore((s) => s.setSearch);
  const setCategoryIds = useShopStore((s) => s.setCategoryIds);
  const cartCount = useCartStore((s) => s.itemCount);
  const dir = useLangStore((s) => s.dir);

  const searchPlaceholder = i18n.language === 'fa' ? 'جستجوی محصولات...' : 'Search products...';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.addEventListener('click', handleClickOutside);
    } else {
      document.body.removeEventListener('click', handleClickOutside);
    }
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRefMegaMenu.current && !menuRefMegaMenu.current.contains(e.target)) {
        setIsOpenMegaMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  const toggleMegaMenu = () => setIsOpenMegaMenu((prev) => !prev);
  const handleMouseEnter = (index: number) => setActiveTab(index);
  const toggleMenu = (e: any) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  const toggleSubMenu = (menuId: any) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };
  const handleMenuClick = (e: any) => {
    e.stopPropagation();
  };

  return (
    <nav>
      <div dir={dir} className="px-4 my-4 container mx-auto">
        <div className="flex flex-wrap items-center justify-between">
          <div className="w-full md:w-7/12 flex items-center md:gap-3 flex-wrap order-2 md:order-1">
            <div className="hidden md:flex md:w-2/24">
              <Link className="w-full h-auto" to="/">
                <img className="w-full h-auto" src={MainLogo} alt="" />
              </Link>
            </div>
            <div className="w-full md:w-8/12 relative flex md:mt-0 bg-color-for-layer-on-body rounded-lg">
              <form
                className="w-full  flex"
                name="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (searchRef.current) setSearchText(searchRef.current.value);
                  navigate('/products');
                }}
              >
                <input
                  name="search"
                  type="search"
                  ref={searchRef}
                  onChange={() => {
                    if (searchRef.current?.value) {
                      setSearchText(searchRef.current.value);
                    } else {
                      setSearchText(undefined);
                    }
                  }}
                  className="w-10/12 px-4 text-base first-text-color-for-paragraph placeholder-gray-400 focus-visible:outline-none rounded-bl-none no-clear-button"
                  placeholder={searchPlaceholder}
                />
                <button className="h-14 cursor-pointer flex items-center justify-center w-2/12 group">
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
          {/* دکمه‌ها و پروفایل */}
          <div className="w-full md:w-5/12 lg:w-3/12 xl:w-2/12 order-1 md:order-2">
            <div className="hidden lg:flex flex-row-reverse items-center gap-3">
              {!isAuthenticated && (
                <Link to="/auth">
                  <button className="font-s-sbold first-text-color flex h-14 items-center justify-center gap-2 rounded-2xl bg-color-for-layer-on-body px-4">
                    <span className="first-text-color">ورود و ثبت نام</span>
                    <div className="h-8 w-8 rounded-full flex justify-center items-center bg-first">
                      <span className="text-color-svg-white">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C11.0111 2 10.0444 2.29324 9.22215 2.84265C8.3999 3.39206 7.75904 4.17295 7.3806 5.08658C7.00216 6.00021 6.90315 7.00555 7.09607 7.97545C7.289 8.94536 7.7652 9.83627 8.46447 10.5355C9.16373 11.2348 10.0546 11.711 11.0245 11.9039C11.9945 12.0969 12.9998 11.9978 13.9134 11.6194C14.827 11.241 15.6079 10.6001 16.1573 9.77785C16.7068 8.95561 17 7.98891 17 7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2ZM12 10C11.4067 10 10.8266 9.82405 10.3333 9.49441C9.83994 9.16476 9.45542 8.69623 9.22836 8.14805C9.0013 7.59987 8.94189 6.99667 9.05764 6.41473C9.1734 5.83279 9.45912 5.29824 9.87868 4.87868C10.2982 4.45912 10.8328 4.1734 11.4147 4.05764C11.9967 3.94189 12.5999 4.0013 13.1481 4.22836C13.6962 4.45542 14.1648 4.83994 14.4944 5.33329C14.8241 5.82664 15 6.40666 15 7C15 7.79565 14.6839 8.55871 14.1213 9.12132C13.5587 9.68393 12.7956 10 12 10ZM21 21V20C21 18.1435 20.2625 16.363 18.9497 15.0503C17.637 13.7375 15.8565 13 14 13H10C8.14348 13 6.36301 13.7375 5.05025 15.0503C3.7375 16.363 3 18.1435 3 20V21H5V20C5 18.6739 5.52678 17.4021 6.46447 16.4645C7.40215 15.5268 8.67392 15 10 15H14C15.3261 15 16.5979 15.5268 17.5355 16.4645C18.4732 17.4021 19 18.6739 19 20V21H21Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                </Link>
              )}
              {isAuthenticated && (
                <div className="relative flex" ref={dropdownRef}>
                  <button
                    onClick={() => setOpen(!open)}
                    className={`bg-color-for-layer-on-body w-44 flex items-center justify-between px-3 py-2 rounded-md ${
                      open ? 'rounded-b-none border-b first-text-color-hr' : ''
                    }`}
                  >
                    {
                      <img
                        src={user?.avatar?.filePath}
                        alt={`عکس پروفایل ${user?.firstName || user?.lastName}`}
                        className="w-6 h-6"
                      />
                    }
                    <span className="first-text-color inline-block h-4 leading-5.5">
                      {user?.firstName}
                    </span>
                    <span className="first-text-color-svg">
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          open ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-full w-full bg-color-for-layer-on-body rounded-t-none rounded-md z-50"
                      >
                        <Link
                          to="/users/me"
                          className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          داشبورد
                        </Link>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          علاقه‌مندی‌ها
                        </Link>
                        <Link
                          to="/cart"
                          className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          سبد خرید
                        </Link>
                        <Link
                          to="/logout"
                          className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                        >
                          خروج
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-color-for-layer-on-body p-4 mx-auto   ">
        {!isMobile ? (
          <div className="items-center  mx-auto justify-between px-4 relative  container  flex  ">
            <div className="flex gap-10 items-center justify-end md:justify-between ">
              <div>
                <ul className="flex  gap-10">
                  <li className=" first-text-color text-base font-f-normal cursor-pointer">
                    <Link className="first-header__ul-link" to={'/'}>
                      <span>پولک</span>
                    </Link>
                  </li>
                  <li
                    className=" first-text-color flex text-base font-f-normal cursor-pointer align-items-center gap-3"
                    onClick={toggleMegaMenu}
                    ref={menuRefMegaMenu}
                  >
                    <span className="block first-text-color">دسته بندی</span>
                    <span className="block first-text-color">
                      <svg
                        className={`w-4 h-4 transform absolute top-3 duration-500 line- transition-transform ${
                          isOpenMegaMenu ? 'rotate-180' : 'rotate-0'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                    {isOpenMegaMenu && (
                      <div
                        className="  bg-color-for-layer-on-body  absolute shadow-dark-md top-15 overflow-hidden  right-0 left-0  mt-2 w-full   shadow-lg rounded-md z-12 transition-all ease-in-out duration-500 transform scale-100 opacity-100"
                        onClick={handleMenuClick}
                      >
                        <div className="  flex">
                          <ul className="w-2/12 p-4 border-l border-gray-300 text-base">
                            {categories?.map((category, index) => (
                              <li
                                key={category.id}
                                className={`py-2 items-center flex cursor-pointer relative group ${
                                  activeTab === index ? 'font-bold' : ''
                                }`}
                                onMouseEnter={() => handleMouseEnter(index)}
                              >
                                {activeTab === index && (
                                  <span
                                    className="
            absolute first-text-color-svg-const flex justify-center bg-first-100 bottom-1/2
            items-center w-8 h-8
            -left-8
            rounded-full
            translate-y-1/2
          "
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path
                                        d="M15 4L7 12L15 20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </span>
                                )}
                                <span className="h-2 w-2 bg-secound rounded-full me-1 opacity-25 group-hover:opacity-100"></span>
                                {category.name}
                              </li>
                            ))}
                          </ul>

                          <div className="py-6 px-8 w-10/12">
                            <div className="flex flex-wrap">
                              <h5 className="text-first w-full font-f-sbold">
                                {categories?.[activeTab]?.name}
                              </h5>
                              <p className="first-text-color-for-paragraph font-f-light">
                                'blah blah blah'
                              </p>
                              <ul className="grid grid-cols-4 mt-8 w-full space-y-4">
                                {categories?.[activeTab]?.children?.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    onClick={() => {
                                      setIsOpenMegaMenu(false);
                                      setCategoryIds([sub.id]);
                                    }}
                                    to={`/products?categoryIds=${sub.id}`}
                                  >
                                    <li
                                      key={sub.id}
                                      className="
                                                        text-base
                                                        relative
                                                        before:h-0.5 before:bg-secound-200
                                                        hover:before:bg-secound
                                                        before:w-2
                                                        before:-right-2
                                                        before:absolute
                                                        before:top-3
                                                        cursor-pointer transition-bg duration-500
                                                    "
                                    >
                                      <span className="ms-2">{sub.name}</span>
                                    </li>
                                  </Link>
                                ))}
                                <li>
                                  <div className="flex w-full ">
                                    <Link
                                      className="flex gap-2 items-center"
                                      onClick={() => {
                                        setIsOpen(false);
                                        setIsOpenMegaMenu(false);
                                      }}
                                      to={`/products?categoryIds=${categories?.[activeTab]?.id}`}
                                    >
                                      <button className="bg-secound text-white py-2 px-4 rounded-lg ">
                                        مشاهده همه
                                      </button>
                                    </Link>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                  <li className=" first-text-color text-base font-f-normal cursor-pointer">
                    <Link className="first-header__ul-link" to={'/about-us'}>
                      درباره ما
                    </Link>
                  </li>
                  <li className=" first-text-color text-base font-f-normal cursor-pointer">
                    <Link className="first-header__ul-link" to={'/contact-us'}>
                      تماس با ما
                    </Link>
                  </li>
                  <li className=" first-text-color text-base font-f-normal cursor-pointer">
                    <Link className="first-header__ul-link" to={'/blogs'}>
                      بلاگ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span>
                  <Link className="cursor-pinter relative" to={'/favorites'}>
                    <span className="first-text-color-svg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 20C12 20 21 16 21 9.71405C21 6 18.9648 4 16.4543 4C15.2487 4 14.0925 4.49666 13.24 5.38071L12.7198 5.92016C12.3266 6.32798 11.6734 6.32798 11.2802 5.92016L10.76 5.38071C9.90749 4.49666 8.75128 4 7.54569 4C5 4 3 6 3 9.71405C3 16 12 20 12 20Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="absolute -top-5 left-3 leading-tight text-xs text-white bg-secound rounded-full w-5 h-5 flex items-center justify-center">
                      {isAuthenticated ? favCounts : 0}
                    </span>
                  </Link>
                </span>
              </div>
              <span>
                <Link
                  className="cursor-pinter rounded-md flex bg-first h-10 w-20 justify-center items-center gap-2 "
                  to="/cart"
                >
                  <span className="bg-first-600 text-white h-5 w-5 rounded-full grid place-items-center text-[14px] leading-6">
                    {cartCount}
                  </span>
                  <span className="first-text-color-svg">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.78571 5H18.2251C19.5903 5 20.5542 6.33739 20.1225 7.63246L18.4558 12.6325C18.1836 13.4491 17.4193 14 16.5585 14H6.07142M4.78571 5L4.74531 4.71716C4.60455 3.73186 3.76071 3 2.76541 3H2M4.78571 5L6.07142 14M6.07142 14L6.25469 15.2828C6.39545 16.2681 7.23929 17 8.23459 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </span>
              <LanguageToggle />
              <ThemeToggleButton />
            </div>
          </div>
        ) : (
          <div className="flex justify-between p-4 ">
            <button className="cursor-pointer" onClick={toggleMenu}>
              <span className="first-text-color-svg">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 17H20M4 12H20M4 7H20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div
                className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-50"
                onClick={() => setIsOpen(false)}
              />
            )}
            <div
              ref={menuRef}
              className={`fixed top-0 z-99 right-0 h-full overflow-y-auto bg-color-for-layer-on-body  transform transition-transform duration-300
                            ${isOpen ? 'translate-x-0  w-9/12' : 'translate-x-full'}`}
            >
              <div className="flex justify-between p-3">
                <div className="w-2/12">
                  <Link to={'/'}>
                    <img className="  " src={MainLogo} alt="" />
                  </Link>
                </div>
                <button onClick={() => setIsOpen(false)} className="cursor-pointer">
                  <span className="first-text-color-svg">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 5L5 19M5.00003 5L19 19"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
              <ul className="flex flex-col space-y-2 mt-10 p-2 ">
                <li className="first-text-color relative ">
                  <div className="flex">
                    <button
                      onClick={() => setHomeMenuOpen(!homeMenuOpen)}
                      className="w-full flex justify-between items-center cursor-pointer text-base"
                    >
                      دسته بندی
                    </button>
                    <span className="flex justify-center rounded-sm items-center w-6 h-6 bg-secound ">
                      <svg
                        className={`w-4 h-4 transform absolute duration-500 transition-transform ${
                          homeMenuOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="white"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>

                  {homeMenuOpen && (
                    <ul className="overflow-hidden transition-all duration-300 mt-4 space-y-2">
                      {categories?.map((menu) => (
                        <li key={menu.id}>
                          <button
                            onClick={() => toggleSubMenu(menu.id)}
                            className="w-full text-right flex font-f-light cursor-pointer mt-1 justify-between items-center"
                          >
                            {menu.name}
                            <span className="flex justify-center rounded-sm items-center w-6 h-6 first-text-color">
                              <svg
                                className={`w-4 h-4 transform absolute duration-500 transition-transform ${
                                  openSubMenu === menu.id ? 'rotate-180' : 'rotate-0'
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </span>
                          </button>

                          {openSubMenu === menu.id && (
                            <ul className="mt-2 py-2 flex flex-col space-y-3 px-4 rounded">
                              {menu.children?.map((sub, index) => (
                                <li key={index}>
                                  <Link
                                    className="flex gap-2 items-center"
                                    onClick={() => {
                                      setCategoryIds([sub.id]);
                                      setIsOpen(false);
                                    }}
                                    to={`/products?categoryIds=${sub.id}`}
                                  >
                                    <span className="h-2 w-2 rounded-full bg-secound flex"></span>
                                    <span className="flex">{sub.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}

                          {openSubMenu === menu.id && (
                            <div className="flex  mt-2">
                              <Link
                                className="flex gap-2 items-center"
                                onClick={() => setIsOpen(false)}
                                to={`/products?categoryIds=${menu.id}`}
                              >
                                <button className="bg-secound text-white py-2 px-4 rounded-lg ">
                                  مشاهده همه
                                </button>
                              </Link>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                <li>
                  <Link className="first-text-color-for-paragraph" to={'/about-us'}>
                    درباره ما
                  </Link>
                </li>
                <li>
                  <Link className="first-text-color-for-paragraph" to={'/contact-us'}>
                    تماس با ما
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex center gap-2">
              <div className="flex  lg:hidden flex-row-reverse items-center w-full gap-3">
                <div className="flex center gap-3">
                  <LanguageToggle />
                  <ThemeToggleButton />
                </div>
                {!isAuthenticated && (
                  <button
                    className={
                      'font-s-sbold first-text-color flex h-14 items-center justify-center gap-2 rounded-xl  bg-color-for-layer-sec px-2 w-40 '
                    }
                  >
                    <Link to="/auth" className="first-text-color">
                      ورود و ثبت نام
                    </Link>
                    <div className="h-8 w-8 rounded-full flex justify-center items-center bg-first">
                      <span className="text-color-svg-white">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C11.0111 2 10.0444 2.29324 9.22215 2.84265C8.3999 3.39206 7.75904 4.17295 7.3806 5.08658C7.00216 6.00021 6.90315 7.00555 7.09607 7.97545C7.289 8.94536 7.7652 9.83627 8.46447 10.5355C9.16373 11.2348 10.0546 11.711 11.0245 11.9039C11.9945 12.0969 12.9998 11.9978 13.9134 11.6194C14.827 11.241 15.6079 10.6001 16.1573 9.77785C16.7068 8.95561 17 7.98891 17 7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2ZM12 10C11.4067 10 10.8266 9.82405 10.3333 9.49441C9.83994 9.16476 9.45542 8.69623 9.22836 8.14805C9.0013 7.59987 8.94189 6.99667 9.05764 6.41473C9.1734 5.83279 9.45912 5.29824 9.87868 4.87868C10.2982 4.45912 10.8328 4.1734 11.4147 4.05764C11.9967 3.94189 12.5999 4.0013 13.1481 4.22836C13.6962 4.45542 14.1648 4.83994 14.4944 5.33329C14.8241 5.82664 15 6.40666 15 7C15 7.79565 14.6839 8.55871 14.1213 9.12132C13.5587 9.68393 12.7956 10 12 10ZM21 21V20C21 18.1435 20.2625 16.363 18.9497 15.0503C17.637 13.7375 15.8565 13 14 13H10C8.14348 13 6.36301 13.7375 5.05025 15.0503C3.7375 16.363 3 18.1435 3 20V21H5V20C5 18.6739 5.52678 17.4021 6.46447 16.4645C7.40215 15.5268 8.67392 15 10 15H14C15.3261 15 16.5979 15.5268 17.5355 16.4645C18.4732 17.4021 19 18.6739 19 20V21H21Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                )}
                {isAuthenticated && (
                  <div className="relative flex" ref={dropdownRef}>
                    <button
                      onClick={() => setOpen(!open)}
                      className={`bg-color-for-layer-sec w-44 flex items-center justify-between px-3 py-2 rounded-md ${
                        open ? 'rounded-b-none border-b first-text-color-hr' : ''
                      }`}
                    >
                      <img
                        src={user?.avatar?.filePath}
                        alt={`عکس پروفایل ${user?.firstName || user?.lastName}`}
                        className="w-6 h-6"
                      />
                      <span className="first-text-color inline-block h-4 leading-5.5">
                        {user?.firstName}
                      </span>
                      <span className="first-text-color-svg">
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${
                            open ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-full w-full bg-color-for-layer-on-body rounded-t-none rounded-md z-50"
                        >
                          <Link
                            to="/users/me"
                            className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          >
                            داشبورد
                          </Link>
                          <Link
                            to="/favorites"
                            className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          >
                            علاقه‌مندی‌ها
                          </Link>
                          <Link
                            to="/cart"
                            className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          >
                            سبد خرید
                          </Link>
                          <Link
                            to="/logout"
                            className="block px-4 py-2 text-sm first-text-color-for-paragraph hover:bg-color-for-layer-sec"
                          >
                            خروج
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <span>
                  <Link className="cursor-pinter relative" to={'/favorites'}>
                    <span className="first-text-color-svg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 20C12 20 21 16 21 9.71405C21 6 18.9648 4 16.4543 4C15.2487 4 14.0925 4.49666 13.24 5.38071L12.7198 5.92016C12.3266 6.32798 11.6734 6.32798 11.2802 5.92016L10.76 5.38071C9.90749 4.49666 8.75128 4 7.54569 4C5 4 3 6 3 9.71405C3 16 12 20 12 20Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="absolute -top-5 left-3 leading-tight text-xs text-white bg-secound rounded-full w-5 h-5 flex items-center justify-center">
                      {isAuthenticated ? favCounts : 0}
                    </span>
                  </Link>
                </span>
                <span>
                  <Link className="cursor-pinter relative" to={'/cart'}>
                    <span className="first-text-color-svg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.78571 5H18.2251C19.5903 5 20.5542 6.33739 20.1225 7.63246L18.4558 12.6325C18.1836 13.4491 17.4193 14 16.5585 14H6.07142M4.78571 5L4.74531 4.71716C4.60455 3.73186 3.76071 3 2.76541 3H2M4.78571 5L6.07142 14M6.07142 14L6.25469 15.2828C6.39545 16.2681 7.23929 17 8.23459 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="absolute -top-5 left-3 leading-tight text-xs text-white bg-secound rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  </Link>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
