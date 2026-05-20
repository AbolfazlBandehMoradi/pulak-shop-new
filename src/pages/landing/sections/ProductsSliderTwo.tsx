import type { Showcase } from '@/hooks/useShowcases';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import formatRating from '@/utils/formatRating';
import cleanText from '@/utils/cleanText';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useLangStore } from '@/stores/languageStore';

interface Props {
  showcase?: Showcase;
}

const ProductsSliderTwo = ({ showcase }: Props) => {
  const lang = useLangStore((s) => s.lang);
  const currency = lang === 'fa' ? 'IRT' : 'USD';

  return (
    <section className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4 ">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex w-full flex-wrap items-center justify-between  lg:w-11/24  ">
          <div className="flex w-full items-center gap-2">
            <div className="first-text-color-svg  inline-block rounded-lg bg-color-for-layer-on-body p-2 ">
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
            </div>
            <div>
              <h2 className="font-s-sbold first-text-color text-xl">
                {showcase?.translation.title}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between lg:justify-end mt-4 lg:mt-0 w-full  lg:w-12/24 lg:gap-3 ">
          <div className="flex  items-center lg:justify-end ">
            <Link
              to={`/products`}
              className="button-with-icon-on-secound-layout   text-sm flex items-center h-14 px-4 rounded-2xl gap-2"
            >
              <span className="button-with-icon-on-secound-layout__span">محصولات بیشتر ...</span>
              <span className="button-with-icon-on-secound-layout__svg h-8 flex justify-center items-center rounded-full w-8">
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
          <div className="flex justify-end ">
            <div
              className="swiper-button-next_product-slider
             w-8 h-8
             lg:w-14 lg:h-14
              cursor-pointer flex justify-center items-center
             bg-secound 
            rounded-sm rounded-e-none
            lg:rounded-xl lg:rounded-e-none
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
            </div>
            <div
              className="swiper-button-prev_product-slider
            cursor-pointer flex justify-center items-center
             w-8 h-8
             lg:w-14 lg:h-14
            rounded-sm rounded-s-none
            lg:rounded-xl lg:rounded-s-none
             bg-secound"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full  mt-4">
        <div className=" flex justify-between flex-wrap overflow-hidden">
          <div className="w-full lg:w-16/48 xl:w-10/48 rounded-xl rounded-b-none lg:rounded-xl relative  bg-linear-to-bl from-first-100 to-first-200  flex flex-col justify-center">
            <div className=" w-full flex flex-col justify-center   p-8 h-full rounded-xl mt-0 ">
              <div className="flex gap-2 mt-3  lg:mt-0 items-center ">
                <span className="first-text-color-svg-const">
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
                <div>
                  <h3 className="text-base font-font-f-light first-text-color-const">
                    محصولات ویژه
                  </h3>
                </div>
              </div>
              <p className="text-sm/6 first-text-color-for-paragraph-const  mb-2 lg:mb-0 mt-2">
                {showcase?.translation.description}
              </p>
            </div>
          </div>
          <div className=" w-full xl:w-38/48 lg:w-32/48 lg:px-4 lg:pe-0 mx-auto relative">
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              loop={true}
              modules={[Navigation]}
              navigation={{
                prevEl: '.swiper-button-prev_product-slider',
                nextEl: '.swiper-button-next_product-slider',
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 3,
                },
                1536: {
                  slidesPerView: 4,
                },
              }}
            >
              {showcase?.items.length &&
                showcase.items?.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div
                      className={`
                transition-all duration-300
              `}
                    >
                      <div className="h-95 bg-color-for-layer-on-body relative rounded-xl rounded-t-none lg:rounded-xl  p-4 flex flex-col justify-between  ">
                        <div className="h-1/2  w-full flex justify-center items-center">
                          <div className="h-full w-full  overflow-hidden flex justify-center items-center rounded-xl">
                            <img
                              src={item.product.image}
                              className="h-full w-full object-contain "
                              alt={item.product.name}
                            />
                          </div>
                        </div>
                        {item.product.discount && (
                          <span
                            className="absolute right-1 flex flex-col items-end top-3 after:absolute after:left-full pr-1 after:h-full after:w-0.75 after:rounded-4xl
                after:rounded-tr-none after:rounded-br-none after:bg-secound  "
                          >
                            <span className="text-xs font-bold  inline-block w-full  text-start text-secound">
                              {item.product.discount}٪
                            </span>
                            <span className="text-xs inline-block w-full  first-text-color-for-paragraph">
                              تخفیف
                            </span>
                          </span>
                        )}
                        <div className="h-1/2  flex flex-col justify-between">
                          <div>
                            <h2 className="font-s-medium text-base first-text-color pt-2 pb-1 ">
                              {item.product.name}
                            </h2>
                            <p className="font-f-light first-text-color-for-paragraph text-sm line-clamp-2 ">
                              {cleanText(item.product?.description)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col justify-between">
                              {item.product.discount ? (
                                <>
                                  <h4 className="text-sm line-through opacity-70 first-text-color-for-paragraph">
                                    <PriceDisplay amount={item.product?.originalPrice || 0} currency={currency} currencyMode="none" languageCode={lang} />
                                  </h4>
                                  <span className="text-sm flex items-center">
                                    <span className="h-2 leading-4 pe-1 font-sm-bold first-text-color-for-paragraph  text-base">
                                      <PriceDisplay amount={item.product?.price} currency={currency} currencyMode="none" languageCode={lang} />
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
                                          fill="#302E2F"
                                        />
                                        <path
                                          d="M5.7043 10.33C4.1843 10.33 3.4243 9.67333 3.4243 8.36C3.4243 8.13333 3.47096 7.4 3.5643 6.16L4.2143 6.21C4.16096 7.21 4.1343 7.86667 4.1343 8.18C4.1343 8.63333 4.28096 8.94 4.5743 9.1C4.8743 9.26 5.2743 9.34 5.7743 9.34C6.24763 9.34 6.6943 9.29 7.1143 9.19C7.54096 9.09 7.87763 8.97 8.1243 8.83L8.0143 5.5L8.8443 5.41V8.46C8.8443 8.86 8.69763 9.2 8.4043 9.48C8.11096 9.76667 7.7243 9.98 7.2443 10.12C6.77096 10.26 6.25763 10.33 5.7043 10.33ZM6.5543 5.13V6.14H5.5843V5.13H6.5543Z"
                                          fill="#302E2F"
                                        />
                                      </svg>
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm flex items-center">
                                  <span className="h-2 leading-4 first-text-color-for-paragraph text-base pe-1">
                                    <PriceDisplay amount={item.product.price} currency={currency} currencyMode="none" languageCode={lang} />
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
                              <span className="text-nowrap text-xs first-text-color-for-paragraph">
                                {formatRating(item.product.rating || 0)}
                              </span>
                              <span className="text-nowrap text-xs first-text-color-for-paragraph">
                                از
                              </span>
                              <span className="text-nowrap text-xs first-text-color-for-paragraph">
                                5
                              </span>
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
                              className="bg-first flex justify-between text-center p-2 rounded-md text-white group"
                            >
                              <span className="text-base w-21/24 font-s-regular">مشاهده محصول</span>
                              <span className=" relative flex justify-center w-3/24">
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
    </section>
  );
};

export default ProductsSliderTwo;
