import { Button } from "@/components/ui/button";
import RemainingTime from "@/components/ui/RemainingTime";
import { Product } from "@/types";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Navigation, EffectCreative, Autoplay } from "swiper/modules";
import { SwiperSlide, Swiper, SwiperRef } from "swiper/react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLangStore } from "@/stores/languageStore";

interface Props {
  discountedProduct: Product[]
}

 
const DiscountedProducts = ({discountedProduct}: Props) => {
const mainSwiper = useRef<SwiperRef>(null);
const { t } = useTranslation();
const lang = useLangStore((s) => s.lang);
const currency = lang === "fa" ? "IRT" : "USD";

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="w-full h-full  flex items-center ">
      <div className=" w-full h-full ">
        <Swiper
          className="rounded-2xl  h-full"
          ref={mainSwiper}
          loop={true}
          effect="creative"
          modules={[Navigation, EffectCreative, Autoplay]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          creativeEffect={{
            prev: {
              shadow: true,
              translate: [0, 0, -400],
            },
            next: {
              translate: ["100%", 0, 0],
            },
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 1 },
            1024: { slidesPerView: 1 },
            1280: { slidesPerView: 1 },
          }}
        >
          {
            discountedProduct.map((product) => (
              <SwiperSlide key={product.id}>
 <div className="p-6 md:p-4   flex-wrap  h-full items-center flex justify-between  rounded-xl ">
      <div className="flex justify-center bg-color-for-layer-on-body gap-3 flex-wrap ">
        <div className="flex flex-row items-start flex-wrap w-full  lg:w-18/48 ">
          <div className="flex rounded-2xl p-6  bg-color-for-layer-sec w-full ">
            <div className="bg-color-for-layer-on-body cursor-grab h-full w-full  flex rounded-2xl justify-center p-6">
              <img
                className="max-w-full h-auto"
                src={product.image}
                alt={product.name}
              />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col   justify-between  lg:w-29/48">
          <h2 className="text-lg first-text-color font-s-bold mt-3 w-full ">
            {product.name}
          </h2>
          <p className="text-base first-text-color mt-1 font-f-light w-full line-clamp-5 xl:line-clamp-6 ">
            {product.description}
          </p>
          {product.saleEndDate && (
            <div className=" w-full  flex justify-between mt-4 flex-wrap items-center">
              <h5 className="text-sm first-text-color ">{t("mainpage.discount.remainingTime")}</h5>
              <RemainingTime expireDate={product.saleEndDate} />
            </div>
          )}
          <div className="lg:hidden  flex xl:flex  w-full flex-wrap mt-4 justify-between items-center ">
            <div className="flex items-center w-30/48 sm:w-24/48  gap-2">
              <div className="bg-first py-1 rounded-md flex  gap-1 px-2   items-center justify-between">
                <span className="flex">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 16L16 8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM17 15C17 16.1046 16.1046 17 15 17C13.8954 17 13 16.1046 13 15C13 13.8954 13.8954 13 15 13C16.1046 13 17 13.8954 17 15ZM11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="flex bg-first-600 px-2 text-white rounded-xs leading-4.5   text-xs items-center ">
                  {product.discount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 line-through">
                  <PriceDisplay amount={product.originalPrice || 0} currency={currency} currencyMode="none" languageCode={lang} />
                </span>
                <span className="text-secound font-bold">
                  <PriceDisplay amount={product.price} currency={currency} currencyMode="none" languageCode={lang} />
                </span>
              </div>
            </div>
            <div className="flex  w-12/48 sm:w-24/48 ">
              <Link
                to={`/products/${product.slug}`}
                className="text-white text-base w-full"
              >
                <Button
                  className={"w-full  rounded-md  bg-first  text-white"}
                >
                  <span className="text-white">{t("mainpage.discount.buy")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden  lg:flex xl:hidden w-full flex-wrap mt-4 justify-between items-center ">
          <div className="flex items-center gap-2">
            <div className="bg-first py-1 rounded-md flex  gap-1 px-2   items-center justify-between">
              <span className="flex">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 16L16 8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM17 15C17 16.1046 16.1046 17 15 17C13.8954 17 13 16.1046 13 15C13 13.8954 13.8954 13 15 13C16.1046 13 17 13.8954 17 15ZM11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="inline-block bg-first-600 px-2 text-white rounded-xs leading-4.5  text-xs items-center ">
               {product.discount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 line-through">
                <PriceDisplay amount={product.originalPrice} currency={currency} currencyMode="none" languageCode={lang} />
              </span>
              <span className="text-secound font-bold">
                <PriceDisplay amount={product.price} currency={currency} currencyMode="none" languageCode={lang} />
              </span>
            </div>
          </div>
          <div className="flex  w-24/48 ">
            <Link
              to={`/products/${product.slug}`}
              className="text-white text-base w-full"
            >
              <Button className={"w-full bg-first  text-white"}>
                <span className="text-white">{t("mainpage.discount.buyThisProduct")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>              </SwiperSlide>
            ))}

        </Swiper>
      </div>
    </div>
  )
}

export default DiscountedProducts
