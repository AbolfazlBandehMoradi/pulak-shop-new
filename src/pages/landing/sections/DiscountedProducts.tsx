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
    <div className="w-full items-stretch rounded-3xl bg-color-for-layer-on-body border border-gray-100 dark:border-gray-900k  flex  ">
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
          <SwiperSlide className="h-full " key={product.id}>
            <div className="group relative h-full  overflow-hidden ">
              <div className="grid  grid-cols-1 lg:grid-cols-2 h-full">
                <div className="relative  flex items-center justify-center    overflow-hidden">
                  <span className="bg-color-for-layer-sec opacity-50 absolute rounded-2xl inset-0"></span>
                  <div className="absolute w-80 h-80 rounded-full border-4 border-red-500/10" />
                  <div className="absolute w-70 h-70 rounded-full bg-red-500/5 blur-3xl" />
                  <div className="absolute top-0  left-0 z-20">
                    <div
                      className=" h-32 w-16  bg-red-500 shadow-2xl flex items-center  "
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)',
                      }}
                    >
                      <span className="flex flex-col justify-center items-center w-full">
                        <span className="text-white text-3xl font-black">{product.discount}</span>
                        <span className="text-white  font-bold">OFF</span>
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
                <div className="flex  flex-col justify-between p-4 md:p-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                        Limited Offer
                      </span>
                    </div>
                    <h2 className="">{product.name}</h2>

                    {/* desc */}
                    <p className="mt-6 text-sm md:text-base leading-8 text-gray-500 dark:text-gray-400 line-clamp-5">
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
                  <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <span className="block text-lg text-gray-400 line-through">
                        <PriceDisplay
                          amount={product.originalPrice || 0}
                          currency={currency}
                          currencyMode="none"
                          languageCode={lang}
                        />
                      </span>

                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-4xl md:text-5xl font-black tracking-tight text-[#111827] dark:text-white">
                          <PriceDisplay
                            amount={product.price}
                            currency={currency}
                            currencyMode="none"
                            languageCode={lang}
                          />
                        </span>

                        <div className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-red-500/20">
                          SAVE
                        </div>
                      </div>
                    </div>

                    {/* button */}
                    <Link to={`/products/${product.slug}`} className="w-full sm:w-auto">
                      <Button
                        className="
                h-16
                px-10
                rounded-2xl
                bg-[#111827]
                hover:bg-black
                dark:bg-white
                dark:hover:bg-gray-200
                text-white
                dark:text-black
                text-base
                font-bold
                transition-all
                duration-300
                hover:scale-[1.03]
                shadow-xl
              "
                      >
                        <span className="flex items-center gap-3">
                          {t('mainpage.discount.buy')}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
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
