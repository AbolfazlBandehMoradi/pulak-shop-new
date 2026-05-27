import { Button } from '@/components/ui/Button';
import RemainingTime from '@/components/ui/RemainingTime';
import { Product } from '@/types';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navigation, Autoplay } from 'swiper/modules';
import { SwiperSlide, Swiper, SwiperRef } from 'swiper/react';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useLangStore } from '@/stores/languageStore';

interface Props {
  discountedProduct: Product[];
}

const DiscountedProducts = ({ discountedProduct }: Props) => {
  const mainSwiper = useRef<SwiperRef>(null);
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const currency = lang === 'fa' ? 'IRT' : 'USD';

  useEffect(() => {
    const interval = setInterval(() => {
      if (mainSwiper.current?.swiper) {
        mainSwiper.current.swiper.slideNext();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (mainSwiper.current?.swiper) {
        mainSwiper.current.swiper.update();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full items-stretch h-full  rounded-3xl  border border-gray-100 dark:border-gray-900  flex  ">
      <Swiper
        ref={mainSwiper}
        loop={true}
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
          1280: { slidesPerView: 1 },
        }}
      >
        {discountedProduct.map((product) => (
          <SwiperSlide className="h-full  " key={product.id}>
            <div className="group relative h-full  overflow-hidden ">
              <div className="grid  grid-cols-1 lg:grid-cols-2 h-full">
                <div className="relative  flex items-center justify-center    overflow-hidden">
                  <span className="bg-color-for-layer-sec opacity-50 absolute rounded-2xl inset-0"></span>
                  <div className="absolute w-40 h-40 lg:w-80 lg:h-80 rounded-full border-4 border-red-500/10" />
                  <div className="absolute w-35 h-35 lg:w-70 lg:h-70 rounded-full bg-red-500/5 blur-3xl" />
                  <div className="absolute top-0  left-0 z-20">
                    <div
                      className=" h-24 w-14  bg-red-500 shadow-2xl flex items-center  "
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)',
                      }}
                    >
                      <span className="flex flex-col justify-center items-center w-full">
                        <span className="text-white text-xl font-s-bold">{product.discount}</span>
                        <span className="text-white  font-bold">%</span>
                      </span>
                    </div>
                  </div>
                  <img
                    className="
            relative
            z-10
            max-h-[420px]
            object-contain
            transition-all
            duration-700
            group-hover:scale-105
            drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]
          "
                    src={product.image}
                    alt={product.name}
                  />
                </div>
                <div className="flex  flex-col justify-between p-2 md:p-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                        {t('mainpage.discount.limitedOffer')}
                      </span>
                    </div>
                    <h2 className="font-s-medium  text-3xl mt-2 mb-1 first-text-color  ">
                      {product.name}
                    </h2>
                    {/* desc */}
                    <p className="font-f-light text-lg first-text-color-for-paragraph mt-2 ">
                      {product.description}
                    </p>

                    {/* timer */}
                    {product.saleEndDate && (
                      <div className="mt-8 flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#111827] px-5 py-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Ends In
                          </p>

                          <h5 className="mt-1 text-sm font-bold text-[#111827] dark:text-white">
                            {t('mainpage.discount.remainingTime')}
                          </h5>
                        </div>

                        <RemainingTime expireDate={product.saleEndDate} />
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
                    <div className="">
                      <span className=" text-lg inline-block relative   text-gray-400 ">
                        <PriceDisplay
                          amount={product.originalPrice || 0}
                          currency={currency}
                          currencyMode="none"
                          languageCode={lang}
                        />
                        <span className="bg-color-for-red absolute h-0.5 opacity-30 rotate-15 top-2 left-0 right-0"></span>
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-4xl md:text-2xl font-black tracking-tight text-[#111827] dark:text-white">
                          <PriceDisplay
                            amount={product.price}
                            currency={currency}
                            currencyMode="none"
                            languageCode={lang}
                          />
                        </span>
                        <div className="text-sm text-red-600">{t('mainpage.discount.save')}</div>
                      </div>
                    </div>

                    {/* button */}
                    <Link to={`/products/${product.slug}`} className="w-full sm:w-auto">
                      <Button className="bg-first  flex text-lg justify-between text-center overflow-hidden px-8 py-2 gap-2 rounded-md text-white group">
                        {t('mainpage.discount.buy')}
                        <div className="flex rotate-180">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DiscountedProducts;
