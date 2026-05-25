import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Showcase } from '@/hooks/useShowcases';
import cleanText from '@/utils/cleanText';
import formatRating from '@/utils/formatRating';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useLangStore } from '@/stores/languageStore';
import { useTranslation } from 'react-i18next';

interface Props {
  showCase?: Showcase;
}

const ProductSlider = ({ showCase }: Props) => {
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const lang = useLangStore((s) => s.lang);
  const currency = lang === 'fa' ? 'IRT' : 'USD';
  const { t } = useTranslation();

  return (
    <section className=" ">
      <div className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex w-full flex-wrap items-center justify-between">
            <div>
              <h2 className="font-s-sbold first-text-color text-base sm:text-xl">
                {t('mainpage.specials.titlePrefix') && (
                  <span>{t('mainpage.specials.titlePrefix')} </span>
                )}
                <span className="text-first me-1 inline-block">
                  {t('mainpage.specials.titleSuffix')}
                </span>
                {t('mainpage.specials.titleAccent')}
              </h2>
              <p className="first-text-color-for-paragraph mt-2 text-sm sm:text-base">
                {t('mainpage.specials.description')}
              </p>
            </div>
            <Link
              className="button-with-icon-on-secound-layout text-sm flex items-center h-12 sm:h-14 px-4 rounded-2xl gap-2"
              to={`/products`}
            >
              <span className=" hidden sm:flex button-with-icon-on-secound-layout__span">
                {t('mainpage.specials.more')}
              </span>
              <span className=" flex sm:hidden button-with-icon-on-secound-layout__span">
                {t('mainpage.specials.moreInPhone')}
              </span>
              <span className="button-with-icon-on-secound-layout__svg h-6 sm:w-8 flex justify-center items-center rounded-full w-6  sm:h-8">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 7L9 12L14 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
        <div className="w-full  bg-color-for-layer-on-body rounded-4xl  overflow-hidden mt-4">
          <div className="flex flex-wrap">
            <div className="relative w-full lg:w-16/48 xl:w-10/48 bg-first p-5 sm:p-8 flex flex-col justify-between">
              <span className="absolute w-6 h-6 bg-color-for-layer-sec -right-3 -bottom-3 rounded-full lg:-left-3 lg:-top-3 lg:right-auto lg:bottom-auto"></span>
              <span className="absolute w-6 h-6 bg-color-for-layer-sec -left-3 -bottom-3 rounded-full "></span>
              <div>
                <div className="flex gap-2 mt-3 items-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <h3 className="text-base font-font-f-light mt-1 text-white">
                      {showCase?.translation.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm/6 text-white mb-3 lg:mb-0 mt-2">
                  {showCase?.translation.description}
                </p>
              </div>
              <div className="flex justify-center md:justify-end gap-2 ">
                <div
                  ref={prevRef}
                  className={`swiper-button-prev_product-sliderflex justify-center flex sm:w-8 sm:h-8 w-10 h-10 items-center rounded bg-white  ${
                    isBeginning ? 'opacity-50 ' : 'cursor-pointer'
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 17L15 12L10 7"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  ref={nextRef}
                  className={`swiper-button-next_product-slider flex justify-center sm:w-8 sm:h-8 w-10 h-10 items-center rounded bg-white ${
                    isEnd ? 'opacity-50 cursor-pointer' : 'cursor-pointer'
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 7L9 12L14 17"
                      stroke="#1b7efb"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-38/48 lg:w-32/48 p-8 sm:p-8 mx-auto relative">
              <Swiper
                slidesPerView={1}
                spaceBetween={32}
                modules={[Navigation]}
                navigation={false} // ابتدا false
                onSwiper={(swiper: SwiperType) => {
                  if (prevRef.current && nextRef.current) {
                    swiper.params.navigation = {
                      prevEl: prevRef.current,
                      nextEl: nextRef.current,
                      disabledClass: 'opacity-30 cursor-not-allowed pointer-events-none',
                    };
                    swiper.navigation.init();
                    swiper.navigation.update();
                  }
                }}
                onSlideChange={(swiper) => {
                  setIsBeginning(swiper.isBeginning);
                  setIsEnd(swiper.isEnd);
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 2 },
                  1280: { slidesPerView: 3 },
                  1536: { slidesPerView: 4 },
                }}
              >
                {showCase?.items?.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div className={`transition-all duration-300`}>
                      <div className="min-h-80 sm:min-h-84  relative flex flex-col  ">
                        <div className="h-40 w-full relative flex justify-center items-center">
                          <div className="h-full w-full z-1 overflow-hidden flex justify-center items-center ">
                            <img
                              src={`${item.product.image}`}
                              className="h-full w-full object-contain "
                              alt={item.product.name || t('common.product')}
                            />
                          </div>
                          <span className="bg-color-for-layer-sec absolute inset-0 rounded-xl opacity-50"></span>
                        </div>
                        {item.product.discount && (
                          <span
                            className="absolute right-1 flex flex-col items-end top-3 after:absolute after:left-full pr-1 after:h-full after:w-0.75 after:rounded-4xl
                after:rounded-tr-none after:rounded-br-none after:bg-secound  "
                          >
                            <span className="text-xs font-bold  inline-block w-full  text-start text-secound">
                              {item.product.discount}
                            </span>
                            <span className="text-xs inline-block w-full  first-text-color-for-paragraph">
                              {t('mainpage.specials.discountBadge')}
                            </span>
                          </span>
                        )}

                        <div className=" flex-1 flex flex-col justify-between ">
                          <div>
                            <h2 className="font-s-medium text-base mt-2 mb-1 first-text-color  ">
                              {item.product?.name}
                            </h2>
                            <p className="font-f-light first-text-color-for-paragraph text-sm line-clamp-2">
                              {cleanText(item.product?.description)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col relative justify-between">
                              {item.product.discount ? (
                                <>
                                  <h4 className="text-sm   opacity-70 first-text-color-for-paragraph">
                                    <PriceDisplay
                                      currencyMode="none"
                                      amount={item.product.originalPrice}
                                      languageCode="fa"
                                      variant="secondary"
                                    />
                                    <span className="bg-color-for-red absolute h-0.5 opacity-30 rotate-15 top-2 left-2 right-0"></span>
                                  </h4>
                                  <span className="text-sm flex items-center">
                                    <span className="h-2 leading-4 pe-1 font-sm-bold first-text-color-for-paragraph  text-base">
                                      <PriceDisplay
                                        amount={item.product.price}
                                        currency={currency}
                                        currencyMode="none"
                                        languageCode={lang}
                                      />
                                    </span>
                                    <span className="first-text-color-svg">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 18 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M3.60758 17C3.14758 17 2.76424 16.9633 2.45758 16.89C2.15758 16.81 1.91758 16.6567 1.73758 16.43C1.55758 16.2033 1.46091 15.8733 1.44758 15.44L1.31758 10.6L2.15758 10.5V15.31C2.15758 15.4833 2.19758 15.62 2.27758 15.72C2.35758 15.82 2.50091 15.8933 2.70758 15.94C2.91424 15.9867 3.21424 16.01 3.60758 16.01L3.70758 16.11V16.9L3.60758 17ZM7.47352 17.03C7.26018 17.03 6.97018 16.9933 6.60352 16.92C6.23685 16.84 5.90352 16.7333 5.60352 16.6C5.30352 16.46 5.13352 16.3033 5.09352 16.13C5.07352 16.05 5.06352 15.96 5.06352 15.86C5.06352 15.7067 5.08685 15.55 5.13352 15.39C5.41352 15.57 5.81018 15.7267 6.32352 15.86C6.84352 15.9867 7.38685 16.0633 7.95352 16.09V13.92H6.65352C6.24685 13.92 5.99018 14.16 5.88352 14.64L5.64352 15.71C5.55018 16.1367 5.34685 16.46 5.03352 16.68C4.72018 16.8933 4.35685 17 3.94352 17H3.60352V16.01H3.93352C4.26685 16.01 4.51018 15.9733 4.66352 15.9C4.82352 15.8267 4.93352 15.7167 4.99352 15.57C5.06018 15.4233 5.13018 15.1767 5.20352 14.83L5.35352 14.14C5.44018 13.7533 5.62685 13.4633 5.91352 13.27C6.20018 13.0767 6.56352 12.98 7.00352 12.98H8.59352V15.96C8.59352 16.3533 8.49685 16.63 8.30352 16.79C8.11018 16.95 7.83352 17.03 7.47352 17.03ZM12.9376 17.14C12.9376 16.28 12.9076 15.6467 12.8476 15.24C12.7942 14.8267 12.6442 14.5067 12.3976 14.28C12.1576 14.0467 11.7642 13.93 11.2176 13.93H10.8576L10.6776 16C10.8509 16.04 11.1709 16.06 11.6376 16.06C12.0776 16.0533 12.6209 16.0333 13.2676 16V16.93C13.2076 16.93 13.1409 16.9333 13.0676 16.94C13.0009 16.9467 12.9276 16.9533 12.8476 16.96C12.2942 17.02 11.8142 17.05 11.4076 17.05C10.9876 17.05 10.6542 16.9733 10.4076 16.82C10.1609 16.66 10.0376 16.3833 10.0376 15.99C10.0376 15.8967 10.0409 15.8267 10.0476 15.78L10.3376 12.98H11.1976C11.8576 12.98 12.3576 13.1133 12.6976 13.38C13.0442 13.6467 13.2776 14.0233 13.3976 14.51C13.5176 14.9967 13.5776 15.6333 13.5776 16.42L12.9376 17.14ZM10.0576 18.22C11.5042 18.0467 12.4642 17.7333 12.9376 17.28V16.36C12.9376 16.3067 12.9842 16.24 13.0776 16.16C13.1776 16.0733 13.2709 16.03 13.3576 16.03C13.5042 16.03 13.5776 16.16 13.5776 16.42C13.5776 16.9467 13.5142 17.37 13.3876 17.69C13.2676 18.0167 12.9642 18.31 12.4776 18.57C11.9976 18.83 11.2476 19.0333 10.2276 19.18L10.0576 18.22ZM13.3076 16.01H14.5076L14.6076 16.11V16.9L14.5076 17H13.3076V16.01ZM14.5117 16.01C14.7851 16.01 15.0851 15.99 15.4117 15.95C15.7384 15.91 15.9684 15.8467 16.1017 15.76L15.9917 13.03L16.8417 12.98V15.3C16.8417 15.92 16.6451 16.36 16.2517 16.62C15.8584 16.8733 15.2784 17 14.5117 17V16.01ZM15.9217 11.08V12H14.7317V11.08H15.9217ZM17.1017 11.08V12H15.9217V11.08H17.1017Z"
                                          fill="currentColor"
                                        />
                                        <path
                                          d="M5.7043 10.33C4.1843 10.33 3.4243 9.67333 3.4243 8.36C3.4243 8.13333 3.47096 7.4 3.5643 6.16L4.2143 6.21C4.16096 7.21 4.1343 7.86667 4.1343 8.18C4.1343 8.63333 4.28096 8.94 4.5743 9.1C4.8743 9.26 5.2743 9.34 5.7743 9.34C6.24763 9.34 6.6943 9.29 7.1143 9.19C7.54096 9.09 7.87763 8.97 8.1243 8.83L8.0143 5.5L8.8443 5.41V8.46C8.8443 8.86 8.69763 9.2 8.4043 9.48C8.11096 9.76667 7.7243 9.98 7.2443 10.12C6.77096 10.26 6.25763 10.33 5.7043 10.33ZM6.5543 5.13V6.14H5.5843V5.13H6.5543Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm flex items-center">
                                  <span className="h-2 leading-4 first-text-color-for-paragraph text-base pe-1">
                                    <PriceDisplay
                                      amount={item.product.price}
                                      currency={currency}
                                      currencyMode="none"
                                      languageCode={lang}
                                    />
                                  </span>
                                  <span className="first-text-color-svg">
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 18 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M3.60758 17C3.14758 17 2.76424 16.9633 2.45758 16.89C2.15758 16.81 1.91758 16.6567 1.73758 16.43C1.55758 16.2033 1.46091 15.8733 1.44758 15.44L1.31758 10.6L2.15758 10.5V15.31C2.15758 15.4833 2.19758 15.62 2.27758 15.72C2.35758 15.82 2.50091 15.8933 2.70758 15.94C2.91424 15.9867 3.21424 16.01 3.60758 16.01L3.70758 16.11V16.9L3.60758 17ZM7.47352 17.03C7.26018 17.03 6.97018 16.9933 6.60352 16.92C6.23685 16.84 5.90352 16.7333 5.60352 16.6C5.30352 16.46 5.13352 16.3033 5.09352 16.13C5.07352 16.05 5.06352 15.96 5.06352 15.86C5.06352 15.7067 5.08685 15.55 5.13352 15.39C5.41352 15.57 5.81018 15.7267 6.32352 15.86C6.84352 15.9867 7.38685 16.0633 7.95352 16.09V13.92H6.65352C6.24685 13.92 5.99018 14.16 5.88352 14.64L5.64352 15.71C5.55018 16.1367 5.34685 16.46 5.03352 16.68C4.72018 16.8933 4.35685 17 3.94352 17H3.60352V16.01H3.93352C4.26685 16.01 4.51018 15.9733 4.66352 15.9C4.82352 15.8267 4.93352 15.7167 4.99352 15.57C5.06018 15.4233 5.13018 15.1767 5.20352 14.83L5.35352 14.14C5.44018 13.7533 5.62685 13.4633 5.91352 13.27C6.20018 13.0767 6.56352 12.98 7.00352 12.98H8.59352V15.96C8.59352 16.3533 8.49685 16.63 8.30352 16.79C8.11018 16.95 7.83352 17.03 7.47352 17.03ZM12.9376 17.14C12.9376 16.28 12.9076 15.6467 12.8476 15.24C12.7942 14.8267 12.6442 14.5067 12.3976 14.28C12.1576 14.0467 11.7642 13.93 11.2176 13.93H10.8576L10.6776 16C10.8509 16.04 11.1709 16.06 11.6376 16.06C12.0776 16.0533 12.6209 16.0333 13.2676 16V16.93C13.2076 16.93 13.1409 16.9333 13.0676 16.94C13.0009 16.9467 12.9276 16.9533 12.8476 16.96C12.2942 17.02 11.8142 17.05 11.4076 17.05C10.9876 17.05 10.6542 16.9733 10.4076 16.82C10.1609 16.66 10.0376 16.3833 10.0376 15.99C10.0376 15.8967 10.0409 15.8267 10.0476 15.78L10.3376 12.98H11.1976C11.8576 12.98 12.3576 13.1133 12.6976 13.38C13.0442 13.6467 13.2776 14.0233 13.3976 14.51C13.5176 14.9967 13.5776 15.6333 13.5776 16.42L12.9376 17.14ZM10.0576 18.22C11.5042 18.0467 12.4642 17.7333 12.9376 17.28V16.36C12.9376 16.3067 12.9842 16.24 13.0776 16.16C13.1776 16.0733 13.2709 16.03 13.3576 16.03C13.5042 16.03 13.5776 16.16 13.5776 16.42C13.5776 16.9467 13.5142 17.37 13.3876 17.69C13.2676 18.0167 12.9642 18.31 12.4776 18.57C11.9976 18.83 11.2476 19.0333 10.2276 19.18L10.0576 18.22ZM13.3076 16.01H14.5076L14.6076 16.11V16.9L14.5076 17H13.3076V16.01ZM14.5117 16.01C14.7851 16.01 15.0851 15.99 15.4117 15.95C15.7384 15.91 15.9684 15.8467 16.1017 15.76L15.9917 13.03L16.8417 12.98V15.3C16.8417 15.92 16.6451 16.36 16.2517 16.62C15.8584 16.8733 15.2784 17 14.5117 17V16.01ZM15.9217 11.08V12H14.7317V11.08H15.9217ZM17.1017 11.08V12H15.9217V11.08H17.1017Z"
                                        fill="currentColor"
                                      />
                                      <path
                                        d="M5.7043 10.33C4.1843 10.33 3.4243 9.67333 3.4243 8.36C3.4243 8.13333 3.47096 7.4 3.5643 6.16L4.2143 6.21C4.16096 7.21 4.1343 7.86667 4.1343 8.18C4.1343 8.63333 4.28096 8.94 4.5743 9.1C4.8743 9.26 5.2743 9.34 5.7743 9.34C6.24763 9.34 6.6943 9.29 7.1143 9.19C7.54096 9.09 7.87763 8.97 8.1243 8.83L8.0143 5.5L8.8443 5.41V8.46C8.8443 8.86 8.69763 9.2 8.4043 9.48C8.11096 9.76667 7.7243 9.98 7.2443 10.12C6.77096 10.26 6.25763 10.33 5.7043 10.33ZM6.5543 5.13V6.14H5.5843V5.13H6.5543Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-start gap-1 border-r-gray-300 border-r pr-1 ">
                              <span className="text-xs first-text-color-for-paragraph">
                                {formatRating(item.product.rating || 0)}
                              </span>
                              <span className="text-xs first-text-color-for-paragraph">
                                {t('mainpage.specials.ratingOutOf')}
                              </span>
                              <span className="text-xs first-text-color-for-paragraph">5</span>
                              <span className=" w-4 h-4">
                                <svg
                                  className="text-amber-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12.5095 17.7915C12.1888 17.6289 11.8112 17.6289 11.4905 17.7915L7.37943 19.8751C6.50876 20.3164 5.52842 19.5193 5.76452 18.562L6.72576 14.6645C6.81767 14.2918 6.72079 13.8972 6.46729 13.6117L3.29416 10.0378C2.66165 9.32543 3.11095 8.18715 4.05367 8.11364L8.48026 7.76848C8.89433 7.73619 9.25828 7.47809 9.43013 7.09485L10.9627 3.67703C11.3675 2.77432 12.6325 2.77432 13.0373 3.67703L14.5699 7.09485C14.7417 7.47809 15.1057 7.73619 15.5197 7.76848L19.9463 8.11364C20.889 8.18715 21.3384 9.32543 20.7058 10.0378L17.5327 13.6117C17.2792 13.8972 17.1823 14.2918 17.2742 14.6645L18.2355 18.562C18.4716 19.5193 17.4912 20.3164 16.6206 19.8751L12.5095 17.7915Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                          <div>
                            <Link
                              to={`/products/${item.product.slug}`}
                              className="bg-first flex justify-between text-center overflow-hidden p-2 rounded-md text-white group"
                            >
                              <span className="text-base w-21/24 font-s-regular">
                                {t('mainpage.specials.viewProduct')}
                              </span>
                              <span
                                className="
          relative flex justify-center w-3/24
          before:content-[''] after:content-['']
          before:absolute after:absolute
          before:w-2 before:h-2 after:w-2 after:h-2
          circle-in-button-card
          before:rounded-full after:rounded-full
          before:-top-3 before:-right-3
          after:-bottom-3 after:-right-3
          before:opacity-100 after:opacity-100
          before:transition-opacity after:transition-opacity
          before:duration-300 after:duration-300
          group-hover:before:opacity-0 group-hover:after:opacity-0
        "
                              >
                                <svg
                                  width="12"
                                  height="24"
                                  viewBox="0 0 12 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
      <span className="bg-color-for-layer-sec-fill">
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
        >
          <path d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"></path>
        </svg>
      </span>
    </section>
  );
};

export default ProductSlider;
