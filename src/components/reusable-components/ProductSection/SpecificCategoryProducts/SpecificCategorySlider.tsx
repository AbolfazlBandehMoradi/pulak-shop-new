import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { SpecificCategoryProductsCard } from './SpecificCategoryProductsCard';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface Props {
  products?: Product[];
  loading?: boolean;

  onLinkHover?: (isHovering: boolean | null, id: number) => void;
}

export const SpecificCategorySlider: React.FC<Props> = ({ products = [], loading = false }) => {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const visibleProducts = useMemo(() => {
    if (loading) return [];
    return products.slice(-3);
  }, [products, loading]);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleLinkHover = (isHovering: boolean | null, id: number) => {
    setHoveredId(isHovering ? id : null);
  };

  const { lang } = useLangStore();

  return (
    <section
      className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4"
      aria-labelledby="specific-category-title"
    >
      <header
        className={`flex flex-wrap items-center justify-between ${
          lang === 'fa' ? ' ' : 'flex flex-row-reverse'
        }`}
      >
        <div
          className={`flex w-full flex-wrap items-center justify-between  lg:w-11/24 ${
            lang === 'fa' ? ' ' : 'flex flex-row-reverse flex-s'
          }`}
        >
          <div
            className={`flex w-full  items-center gap-2 ${
              lang === 'fa' ? ' ' : 'flex flex-row-reverse'
            }`}
          >
            <h2 className="font-s-sbold gap-1 flex first-text-color text-2xl">
              <span>{t('product.products')}</span>
              <span>{t('product.zhofar')}</span>
            </h2>
          </div>
        </div>

        <div
          className={`flex items-center justify-between lg:justify-end mt-4 lg:mt-0 w-full  lg:w-12/24 lg:gap-3 ${
            lang === 'fa' ? ' ' : 'flex flex-row-reverse'
          }`}
        >
          <div
            className={`mt-4 flex w-full lg:mt-0  ${
              lang === 'fa' ? 'lg:w-6/12 lg:flex-row-reverse' : ''
            }`}
          >
            <Link
              className={`button-with-icon-on-secound-layout text-sm flex items-center h-14 px-4 rounded-2xl gap-2 ${lang === "fa"
                ? ""
                : "flex-row-reverse"
                }`}
              to={localizedPath("/products?categoryIds=21")}
            >
              <span className="button-with-icon-on-secound-layout__span">
                {t('product.viewAll')}
              </span>
              <span
                className={`button-with-icon-on-secound-layout__svg h-8 flex justify-center items-center rounded-full w-8 ${
                  lang === 'fa' ? ' rotate-0' : ' rotate-180'
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
      </header>

      <div className="w-full rounded-4xl p-8 bg-secound mt-4">
        <div className="flex flex-wrap">
          <div className="relative w-full lg:w-16/48 xl:w-10/48 rounded-l-none rounded-4xl p-8 flex flex-col justify-between">
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-base text-center font-font-f-light mt-1 text-white">
                  {lang === 'fa' ? (
                    <svg
                      width="100%"
                      height="60"
                      viewBox="0 0 173 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M70.4514 37.4889C70.6647 37.4889 70.7714 37.5956 70.7714 37.8089V43.3769C70.7714 43.5902 70.6647 43.6969 70.4514 43.6969H69.1714C68.83 43.6969 68.5847 43.6862 68.4354 43.6649C68.3287 45.1582 68.0194 46.4276 67.5074 47.4729C66.9954 48.5396 66.174 49.5209 65.0434 50.4169C63.934 51.3129 62.3767 52.2516 60.3714 53.2329L58.1634 48.3049C59.6567 47.4089 60.702 46.6836 61.2994 46.1289C61.8967 45.5742 62.2594 45.0302 62.3874 44.4969C62.5367 43.9636 62.6114 43.0996 62.6114 41.9049V30.7049H68.4994V36.7849C68.4994 36.9982 68.5527 37.1689 68.6594 37.2969C68.7874 37.4249 68.958 37.4889 69.1714 37.4889H70.4514ZM75.9251 15.9209H80.8851V20.8809H75.9251V15.9209ZM70.4531 43.6969C70.2398 43.6969 70.1331 43.5902 70.1331 43.3769V37.8089C70.1331 37.5956 70.2398 37.4889 70.4531 37.4889H78.3891C78.8158 37.4889 79.0291 37.2649 79.0291 36.8169V36.7209H78.3891C77.1091 36.7209 75.9358 36.4329 74.8691 35.8569C73.8025 35.2809 72.9491 34.5022 72.3091 33.5209C71.6905 32.5182 71.3811 31.4089 71.3811 30.1929C71.3811 28.8916 71.7011 27.6969 72.3411 26.6089C72.9811 25.5209 73.8345 24.6676 74.9011 24.0489C75.9891 23.4089 77.1518 23.0889 78.3891 23.0889C79.6265 23.0889 80.7358 23.4089 81.7171 24.0489C82.7198 24.6676 83.4985 25.5209 84.0531 26.6089C84.6291 27.6756 84.9171 28.8702 84.9171 30.1929V37.2009C84.9171 38.3742 84.6291 39.4622 84.0531 40.4649C83.4771 41.4462 82.6985 42.2356 81.7171 42.8329C80.7358 43.4089 79.6478 43.6969 78.4531 43.6969H70.4531ZM79.4131 29.9689C79.4131 29.6276 79.2851 29.3396 79.0291 29.1049C78.7945 28.8489 78.5065 28.7209 78.1651 28.7209C77.7811 28.7209 77.4718 28.8382 77.2371 29.0729C77.0025 29.3076 76.8851 29.6062 76.8851 29.9689C76.8851 30.3529 77.0025 30.6729 77.2371 30.9289C77.4718 31.1636 77.7811 31.2809 78.1651 31.2809H79.4131V29.9689ZM88.9709 48.0489C90.7842 47.2809 92.1389 46.6409 93.0349 46.1289C93.9309 45.6382 94.5175 45.2116 94.7949 44.8489C95.0722 44.5076 95.2109 44.1236 95.2109 43.6969H94.0269C92.6615 43.6969 91.4029 43.3982 90.2509 42.8009C89.0989 42.1822 88.1815 41.3396 87.4989 40.2729C86.8375 39.1849 86.5069 37.9689 86.5069 36.6249C86.5069 35.2596 86.8482 34.0009 87.5309 32.8489C88.2135 31.6969 89.1202 30.7902 90.2509 30.1289C91.4029 29.4462 92.6615 29.1049 94.0269 29.1049C95.3709 29.1049 96.5762 29.4462 97.6429 30.1289C98.7309 30.7902 99.5735 31.6969 100.171 32.8489C100.79 34.0009 101.099 35.2596 101.099 36.6249V41.0729C101.099 43.2702 100.8 45.0302 100.203 46.3529C99.6055 47.6969 98.5922 48.8809 97.1629 49.9049C95.7335 50.9289 93.6109 52.0382 90.7949 53.2329L88.9709 48.0489ZM95.2109 36.6249C95.2109 36.2196 95.1042 35.8996 94.8909 35.6649C94.6775 35.4302 94.3895 35.3129 94.0269 35.3129C93.6429 35.3129 93.3229 35.4302 93.0669 35.6649C92.8322 35.8996 92.7149 36.2196 92.7149 36.6249C92.7149 37.0089 92.8322 37.3182 93.0669 37.5529C93.3229 37.7662 93.6429 37.8729 94.0269 37.8729H95.2109V36.6249ZM109.763 23.1849H112.323V28.1449H102.403V23.1849H104.803V18.8649H109.763V23.1849ZM104.355 30.7049H110.243V41.9049C110.243 43.7609 110.051 45.2862 109.667 46.4809C109.304 47.6969 108.696 48.7956 107.843 49.7769C107.011 50.7796 105.773 51.9316 104.131 53.2329L100.835 48.9449C101.944 47.9636 102.744 47.1529 103.235 46.5129C103.725 45.8729 104.035 45.2329 104.163 44.5929C104.291 43.9742 104.355 43.0782 104.355 41.9049V30.7049Z"
                        fill="white"
                      />
                      <path
                        d="M98.5473 11.2267L99.0771 11.6794L99.9825 10.6198L99.4527 10.1671L99 10.6969L98.5473 11.2267ZM62.4706 0.182899C62.1867 -0.0770114 61.7459 -0.0575847 61.486 0.22629C61.2261 0.510164 61.2455 0.950989 61.5294 1.2109L62 0.696899L62.4706 0.182899ZM99 10.6969L99.4527 10.1671L94.2817 5.74893L93.829 6.27877L93.3763 6.80861L98.5473 11.2267L99 10.6969ZM67.9578 4.95065L68.2849 4.33524L66.8805 3.58899L66.5535 4.20441L66.2264 4.81982L67.6308 5.56607L67.9578 4.95065ZM63.3935 1.97281L63.8642 1.45881L62.4706 0.182899L62 0.696899L61.5294 1.2109L62.9229 2.48681L63.3935 1.97281ZM66.5535 4.20441L66.8805 3.58899C65.7891 3.0091 64.7756 2.29335 63.8642 1.45881L63.3935 1.97281L62.9229 2.48681C63.9212 3.40081 65.0312 4.18472 66.2264 4.81982L66.5535 4.20441ZM79.7751 4.85337L79.438 4.24343C75.9749 6.15741 71.7791 6.19195 68.2849 4.33524L67.9578 4.95065L67.6308 5.56607C71.5412 7.64389 76.2366 7.60523 80.1122 5.46332L79.7751 4.85337ZM93.829 6.27877L94.2817 5.74893C90.1311 2.20264 84.2162 1.60273 79.438 4.24343L79.7751 4.85337L80.1122 5.46332C84.3819 3.10363 89.6674 3.63971 93.3763 6.80861L93.829 6.27877Z"
                        fill="white"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="100%"
                      height="60"
                      viewBox="0 0 102 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M97.9863 11.2267L98.5161 11.6794L99.4215 10.6198L98.8917 10.1671L98.439 10.6969L97.9863 11.2267ZM61.9096 0.182899C61.6257 -0.0770114 61.1849 -0.0575847 60.925 0.22629C60.6651 0.510164 60.6845 0.950989 60.9684 1.2109L61.439 0.696899L61.9096 0.182899ZM98.439 10.6969L98.8917 10.1671L93.7206 5.74893L93.268 6.27877L92.8153 6.80861L97.9863 11.2267L98.439 10.6969ZM67.3968 4.95065L67.7238 4.33524L66.3194 3.58899L65.9924 4.20441L65.6654 4.81982L67.0698 5.56607L67.3968 4.95065ZM62.8325 1.97281L63.3031 1.45881L61.9096 0.182899L61.439 0.696899L60.9684 1.2109L62.3619 2.48681L62.8325 1.97281ZM65.9924 4.20441L66.3194 3.58899C65.2281 3.0091 64.2146 2.29335 63.3031 1.45881L62.8325 1.97281L62.3619 2.48681C63.3602 3.40081 64.4702 4.18472 65.6654 4.81982L65.9924 4.20441ZM79.2141 4.85337L78.877 4.24343C75.4138 6.15741 71.218 6.19195 67.7238 4.33524L67.3968 4.95065L67.0698 5.56607C70.9801 7.64389 75.6756 7.60523 79.5512 5.46332L79.2141 4.85337ZM93.268 6.27877L93.7206 5.74893C89.57 2.20264 83.6551 1.60273 78.877 4.24343L79.2141 4.85337L79.5512 5.46332C83.8209 3.10363 89.1063 3.63971 92.8153 6.80861L93.268 6.27877Z"
                        fill="white"
                      />
                      <path
                        d="M15.1361 38.6969H0.35209V32.9369L6.97609 27.3689H8.98838e-05V21.6729H15.5201V27.3689L9.12009 33.0009H15.1361V38.6969ZM26.6068 21.1929C27.9082 21.1929 29.0815 21.5449 30.1268 22.2489C31.1722 22.9316 31.9828 23.8702 32.5588 25.0649C33.1562 26.2382 33.4548 27.5289 33.4548 28.9369V38.6969H27.2468V29.1289C27.2468 28.6596 27.0655 28.2436 26.7028 27.8809C26.3402 27.5182 25.9028 27.3369 25.3908 27.3369C24.9215 27.3369 24.5055 27.5182 24.1428 27.8809C23.7802 28.2436 23.5988 28.6596 23.5988 29.1289V38.6969H17.3908V14.3769H23.5988V22.0889C24.5162 21.4916 25.5188 21.1929 26.6068 21.1929ZM44.5071 39.1769C42.8004 39.1769 41.2218 38.7716 39.7711 37.9609C38.3204 37.1502 37.1684 36.0622 36.3151 34.6969C35.4831 33.3102 35.0671 31.7956 35.0671 30.1529C35.0671 28.5316 35.4831 27.0382 36.3151 25.6729C37.1684 24.2862 38.3204 23.1982 39.7711 22.4089C41.2218 21.5982 42.8004 21.1929 44.5071 21.1929C46.2138 21.1929 47.7818 21.5982 49.2111 22.4089C50.6404 23.1982 51.7711 24.2862 52.6031 25.6729C53.4564 27.0382 53.8831 28.5316 53.8831 30.1529C53.8831 31.7956 53.4564 33.3102 52.6031 34.6969C51.7711 36.0622 50.6404 37.1502 49.2111 37.9609C47.7818 38.7716 46.2138 39.1769 44.5071 39.1769ZM44.4751 33.3849C45.3711 33.3849 46.1284 33.0756 46.7471 32.4569C47.3658 31.8382 47.6751 31.0809 47.6751 30.1849C47.6751 29.2889 47.3658 28.5316 46.7471 27.9129C46.1284 27.2942 45.3711 26.9849 44.4751 26.9849C43.5791 26.9849 42.8218 27.2942 42.2031 27.9129C41.5844 28.5316 41.2751 29.2889 41.2751 30.1849C41.2751 31.0809 41.5844 31.8382 42.2031 32.4569C42.8218 33.0756 43.5791 33.3849 44.4751 33.3849ZM65.5853 19.0169C65.372 19.0169 65.2013 19.0809 65.0733 19.2089C64.9453 19.3369 64.8813 19.5289 64.8813 19.7849V21.6729H68.4013V27.3689H64.8813V38.6969H58.6733V27.3689H55.1533V21.6729H58.6733V20.0729C58.6733 18.8782 58.9613 17.7902 59.5373 16.8089C60.1347 15.8062 60.9347 15.0276 61.9373 14.4729C62.94 13.8969 64.028 13.6089 65.2013 13.6089H69.0413V19.0169H65.5853ZM88.6643 21.6729V38.6969H83.5443V37.1289C82.3923 38.4942 80.8243 39.1769 78.8403 39.1769C77.219 39.1769 75.715 38.7716 74.3283 37.9609C72.963 37.1289 71.875 36.0302 71.0643 34.6649C70.2537 33.2782 69.8483 31.7742 69.8483 30.1529C69.8483 28.5529 70.2537 27.0702 71.0643 25.7049C71.875 24.3182 72.963 23.2196 74.3283 22.4089C75.715 21.5982 77.219 21.1929 78.8403 21.1929C80.8243 21.1929 82.3923 21.8756 83.5443 23.2409V21.6729H88.6643ZM79.2563 33.3849C80.1523 33.3849 80.9097 33.0756 81.5283 32.4569C82.147 31.8382 82.4563 31.0809 82.4563 30.1849C82.4563 29.2889 82.147 28.5316 81.5283 27.9129C80.9097 27.2942 80.1523 26.9849 79.2563 26.9849C78.3603 26.9849 77.603 27.2942 76.9843 27.9129C76.3657 28.5316 76.0563 29.2889 76.0563 30.1849C76.0563 31.0809 76.3657 31.8382 76.9843 32.4569C77.603 33.0756 78.3603 33.3849 79.2563 33.3849ZM101.995 21.6729V27.3689H98.8908C98.3575 27.3689 97.8668 27.5822 97.4188 28.0089C96.9922 28.4356 96.7788 28.9262 96.7788 29.4809V38.6969H90.5708V21.6729H95.6908V24.2969C97.0135 22.5476 98.7202 21.6729 100.811 21.6729H101.995Z"
                        fill="white"
                      />
                    </svg>
                  )}
                </h3>
              </div>
              <p className="text-xl w-8/12 mx-auto text-center font-s-medium text-white mb-2 lg:mb-0 mt-2">
                <span>{t('privete.shoarInZhofar')}</span>
              </p>
              <ul className="flex flex-col text-white font-f-light text-center">
                <li>{t('privete.edible')}</li>
                <li>{t('privete.noAlcohol')}</li>
                <li>{t('privete.noRinse')}</li>
              </ul>
              <div className="flex justify-center gap-2 ">
                <div
                  ref={prevRef}
                  className={`swiper-button-prev_product-sliderflex justify-center flex w-8 h-8 items-center rounded bg-white ${
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
                  className={`swiper-button-next_product-slider flex justify-center w-8 h-8 items-center rounded bg-white ${
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
          </div>
          <div className="w-full xl:w-38/48 lg:w-32/48 mx-auto rounded-r-none rounded-4xl relative">
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              modules={[Navigation]}
              navigation={false}
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
                1536: { slidesPerView: 3 },
              }}
            >
              {visibleProducts?.map((product) => (
                <SwiperSlide key={product.id}>
                  <div
                    className={`transition-all duration-300 ${
                      hoveredId && hoveredId !== parseInt(product.id)
                        ? 'blur-xs opacity-100 scale-[0.95]'
                        : ''
                    } ${hoveredId === parseInt(product.id) ? 'z-10' : ''}`}
                  >
                    {/* اضافه شدن لینک برای کارت محصول */}
                    <Link to={localizedPath(`/products/${product.slug}`)}>
                      <SpecificCategoryProductsCard
                        product={product}
                        onLinkHover={handleLinkHover}
                      />
                    </Link>
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
