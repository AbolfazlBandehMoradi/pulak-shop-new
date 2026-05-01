import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { ShowCasesCardNumberThree } from './ShowCasesCardNumberThree';
import { Showcase } from '@/hooks/useShowcases';
import 'swiper/swiper.css';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface Props {
  showCase?: Showcase;
  loading?: boolean;
}

const ShowCasesNumberThree = ({ showCase }: Props) => {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const handleLinkHover = (isHovering: boolean | null, id: number) => {
    setHoveredId(isHovering ? id : null);
  };
  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      swiperRef.current.params.navigation = {
        prevEl: prevRef.current,
        nextEl: nextRef.current,
        disabledClass: 'opacity-40 pointer-events-none',
      };
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, []);
  const { lang } = useLangStore();
  return (
    <section className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4">
      {/* Header */}
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
              <span>{t('product.nonSterile')}</span>
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
              to={localizedPath(`/products?categoryIds=${2}`)}
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

      <div className="w-full rounded-4xl p-6 lg:p-8 bg-linear-to-br from-first via-first-700 to-third mt-4 border border-first-300/35 shadow-first-md">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-16/48 flex flex-col justify-center xl:w-10/48 p-6 lg:p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-xl text-center text-white mb-4">
              <span>{t('product.nonSterileDes')}</span>
            </p>
            <div className="flex justify-center  gap-2 ">
              <div
                ref={prevRef}
                className={`swiper-button-prev_product-sliderflex justify-center flex w-10 h-10 items-center rounded-xl bg-white/95 shadow-lg transition-all ${
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
                className={`swiper-button-next_product-slider flex justify-center w-10 h-10 items-center rounded-xl bg-white/95 shadow-lg transition-all ${
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
          <div className="w-full lg:w-32/48 xl:w-38/48">
            <Swiper
              modules={[Navigation]}
              slidesPerView={1}
              spaceBetween={24}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
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
                      <ShowCasesCardNumberThree
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
export default ShowCasesNumberThree;
