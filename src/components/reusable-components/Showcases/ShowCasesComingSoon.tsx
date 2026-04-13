import { t } from 'i18next';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Showcase } from '@/hooks/useShowcases';
import { ShowCaseCardComingSoon } from './ShowCaseCardComingSoon';
import { useLangStore } from '@/stores/languageStore';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface Props {
  showCase?: Showcase;
}

const ShowCasesComingSoon = ({ showCase }: Props) => {
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
      <span className="bg-secound absolute left-4 right-4  top-0 h-1/2 rounded-2xl"></span>
      <div className="w-full rounded-4xl p-8  ">
        <div
          className={`flex flex-wrap z-20 relative items-center justify-between ${
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
              <h2
                className={`font-s-sbold gap-1 flex  text-white text-2xl ${
                  lang === 'fa' ? ' ' : ' flex-row-reverse'
                }`}
              >
                <span>{t('product.comingSoon')}</span>
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
              {/* <Link
                className={`button-with-icon-on-secound-layout text-sm flex items-center h-14 px-4 rounded-2xl gap-2 ${
                  lang === 'fa' ? '' : 'flex-row-reverse'
                }`}
                to={'/products'}
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
              </Link> */}
            </div>
          </div>
        </div>
        <div className="flex mt-4  flex-wrap">
          <div className="w-full   mx-auto rounded-r-none rounded-4xl relative ">
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
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
                    <Link to={localizedPath(`/products/${item.product.slug}`)}>
                      <ShowCaseCardComingSoon showCaseItem={item} onLinkHover={handleLinkHover} />
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

export default ShowCasesComingSoon;
