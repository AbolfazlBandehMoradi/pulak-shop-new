import { t } from 'i18next';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Showcase } from '@/hooks/useShowcases';
import { ShowCasesCardNumberTwo } from './ShowCasesCardNumberTwo';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface Props {
  showCase?: Showcase;
}

const ShowCasesNumberTwo = ({ showCase }: Props) => {
  const localizedPath = useLocalizedPath();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [, setIsBeginning] = useState(true);
  const [, setIsEnd] = useState(false);

  const handleLinkHover = (isHovering: boolean | null, id: number) => {
    setHoveredId(isHovering ? id : null);
  };
  const { lang } = useLangStore();
  return (
    <section
      className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4"
      aria-labelledby="coming-soon-heading"
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
      <div className="w-full mt-4 rounded-4xl p-4 lg:p-6 bg-linear-to-br from-first-50 via-white to-secound-50 border border-first-100/80 shadow-[0_16px_36px_-30px_rgba(27,126,251,0.5)]">
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
              {showCase?.items.map((item) => (
                <SwiperSlide key={item.id}>
                  <div
                    onMouseEnter={() => handleLinkHover(true, item.id)}
                    onMouseLeave={() => handleLinkHover(false, item.id)}
                    className={`transition-all duration-300 ${
                      hoveredId && hoveredId !== item.id ? 'blur-xs opacity-80 scale-[0.95]' : ''
                    } ${hoveredId === item.id ? 'z-10' : ''}`}
                  >
                    <Link to={`/products/${item.product.slug}`}>
                      <ShowCasesCardNumberTwo
                        showCaseItem={item}
                        onLinkHover={handleLinkHover} // کارت خودش هم می‌تونه این prop رو صدا بزنه
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

export default ShowCasesNumberTwo;
