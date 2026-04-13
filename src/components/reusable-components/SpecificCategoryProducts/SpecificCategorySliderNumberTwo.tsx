import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types';
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { SpecificCategoryProductsCardNumberTwo } from './SpecificCategoryProductsCardNumberTwo';
import { useLangStore } from '@/stores/languageStore';
import { Showcase } from '@/hooks/useShowcases';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface Props {
  products?: Product[];
  loading?: boolean;
}
interface Props {
  showCase?: Showcase;
}
export const SpecificCategorySliderNumberTwo: React.FC<Props> = ({
  products = [],
  loading = false,
}) => {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const visibleProducts = useMemo(() => {
    if (loading) return [];
    return products.slice(-5);
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
              <span>{t('product.Sterile')}</span>
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
              className={`button-with-icon-on-secound-layout text-sm flex items-center h-14 px-4 rounded-2xl gap-2 ${
                lang === 'fa' ? '' : 'flex-row-reverse'
              }`}
              to={localizedPath('/products?categoryIds=1')}
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

      <div className="w-full   mt-4">
        <div className="flex flex-wrap">
          <div className="w-full  mx-auto rounded-r-none rounded-4xl relative">
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
                    onMouseEnter={() => handleLinkHover(true, parseInt(product.id))}
                    onMouseLeave={() => handleLinkHover(false, parseInt(product.id))}
                    className={`transition-all duration-300 ${
                      hoveredId && hoveredId !== parseInt(product.id)
                        ? 'blur-xs opacity-100 scale-[0.95]'
                        : ''
                    } ${hoveredId === parseInt(product.id) ? 'z-10' : ''}`}
                  >
                    <Link to={localizedPath(`/products/${product.slug}`)}>
                      <SpecificCategoryProductsCardNumberTwo
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
        <div className="flex justify-center gap-2 mt-4 ">
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
    </section>
  );
};
