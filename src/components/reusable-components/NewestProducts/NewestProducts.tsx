import React, { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Product } from "@/types";
import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { NewestProductsCard } from "./NewestProductsCard";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
interface NewestProductsProps {
  products?: Product[];
  loading?: boolean;
}

export const NewestProducts: React.FC<NewestProductsProps> = ({
  products = [],
  loading = false,
}) => {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const newestProducts = useMemo(() => {
    if (loading) return [];
    return products.slice(0, 8);
  }, [products, loading]);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleLinkHover = (isHovering: boolean | null, id: number) => {
    setHoveredId(isHovering ? id : null);
  };
  return (
    <section
      className="product-slider relative sm:container mx-auto mt-8 lg:mt-16 px-4 "
      aria-labelledby="newest-products-heading"
    >
      <header className="flex flex-wrap items-center justify-between">
        <div className="flex w-full flex-wrap items-center justify-between  lg:w-11/24  ">
          <div className="flex w-full items-center gap-2">
            <h2 className="font-s-sbold first-text-color text-2xl">
              {t("products.newest")}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-between lg:justify-end mt-4 lg:mt-0 w-full  lg:w-12/24 lg:gap-3 ">
          <div className="mt-4 flex w-full lg:mt-0 lg:w-6/12 lg:flex-row-reverse">
            <Link
              className="button-with-icon-on-secound-layout   text-sm flex items-center h-14 px-4 rounded-2xl gap-2"
              to={localizedPath(`/products`)}
            >
              <span className="button-with-icon-on-secound-layout__span">
                {t("product.viewAll")}
              </span>
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
        </div>
      </header>
      <div className="w-full rounded-4xl p-8 bg-secound  mt-4">
        <div className="flex  flex-wrap">
          <aside className="relative  w-full lg:w-16/48 xl:w-10/48 rounded-l-none rounded-4xl  p-8 flex flex-col justify-between">
            <div className=" flex flex-col justify-center h-full">
              <div>
                <h3 className="text-3xl text-center font-s-bold mt-1 leading-10 text-white">
                  جدیدترین محصولات
                </h3>
              </div>
              <div className="flex justify-center mt-4 gap-2 ">
                <div
                  ref={prevRef}
                  className={`swiper-button-prev_product-sliderflex justify-center flex w-8 h-8 items-center rounded bg-white  ${isBeginning ? "opacity-50 " : "cursor-pointer"
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
                  className={`swiper-button-next_product-slider flex justify-center w-8 h-8 items-center rounded bg-white ${isEnd ? "opacity-50 cursor-pointer" : "cursor-pointer"
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
          </aside>
          <div className="w-full  xl:w-38/48  lg:w-32/48  mx-auto rounded-r-none rounded-4xl relative ">
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
                    disabledClass:
                      "opacity-30 cursor-not-allowed pointer-events-none",
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
              {newestProducts?.map((product) => (
                <SwiperSlide key={product.id}>
                  <div
                    className={`transition-all duration-300 ${hoveredId && hoveredId !== parseInt(product.id)
                      ? "blur-xs opacity-100 scale-[0.95]"
                      : ""
                      } ${hoveredId === parseInt(product.id) ? "z-10" : ""}`}
                  >
                    <NewestProductsCard
                      product={product}
                      onLinkHover={handleLinkHover}
                    />
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
