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
import cleanText from '@/utils/cleanText';
import Typewriter from '@/components/ui/Typewriter';
import { useInView } from '@/hooks/useInView';

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
  const { ref, isVisible } = useInView<HTMLDivElement>();

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
            <h2 className="font-s-sbold first-text-color text-xl">
              <span>{showCase?.translation.title}</span>
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
      <div className="w-full  mt-4">
        <div ref={ref} className="flex justify-between flex-wrap overflow-hidden">
          <div className="  w-full lg:w-16/48  xl:w-10/48 p-4  rounded-b-none lg:rounded-xl rounded-xl relative border-first  bg-first flex flex-col justify-center ">
            <div className="absolute inset-0 z-1">
              <svg
                width="539"
                height="809"
                viewBox="0 0 539 809"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#filter0_f_4791_605)">
                  <path
                    d="M588 -65H554.215L35 932H211.665L588 -65Z"
                    fill="white"
                    fillOpacity="0.4"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_f_4791_605"
                    x="-65"
                    y="-165"
                    width="753"
                    height="1197"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_4791_605" />
                  </filter>
                </defs>
              </svg>
            </div>
            <div className="relative w-full h-full overflow-hidden rounded-lg rounded-b-none lg:rounded-lg  bg-white/10 backdrop-blur-xs border border-white/30 text-white flex flex-col items-center justify-center">
              <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[60px] bg-gradient-to-br from-first-500/80 to-first-500/40 animate-float1" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[60px] bg-gradient-to-br from-first-700/80 to-first-400/40 animate-float2" />
              <div className="absolute top-[60%] left-[20%] w-[30vw] h-[30vw] rounded-full blur-[60px] bg-gradient-to-br from-first-500/50 to-first-300/30 animate-float3" />
              <div className="absolute inset-0 opacity-5 z-10 noise-overlay" />
              <div className="relative z-20 text-center max-w-xl px-4">
                <div className=" w-full flex flex-col  justify-center ">
                  <div className=" h-32 w-full">
                    <p className="text-sm/6  text-white text-start w-full  mb-2 lg:mb-0 mt-2">
                      <Typewriter
                        text={cleanText(showCase?.translation.description || '')}
                        loop={0}
                        cursor
                        cursorStyle="|"
                        typeSpeed={70}
                        delaySpeed={2000}
                        start={isVisible}
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div id="particles-container" className="absolute inset-0 z-10 pointer-events-none" />
            </div>
          </div>
          <div className=" w-full xl:w-38/48 lg:w-32/48 lg:px-4 lg:pe-0 mx-auto relative">
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
