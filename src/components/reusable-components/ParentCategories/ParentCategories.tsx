import { useLangStore } from "@/stores/languageStore";
import { Category } from "@/types";
import getLocalizedText from "@/utils/getLocalizedText";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import "swiper/swiper.css";

interface Props {
  categories: Category[];
}

const ParentCategories = ({ categories }: Props) => {
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const localizedPath = useLocalizedPath();

  return (
    <section
      className="mx-auto mt-8 px-4 sm:container"
      aria-labelledby="parent-categories-title"
    >
      <header
        className={`mb-4 flex flex-wrap items-center justify-between ${lang === "fa"
          ? " "
          : "flex flex-row-reverse"
          }`}
      >
        <h2
          id="parent-categories-title"
          className="font-s-sbold text-2xl first-text-color"
        >
          {t("categories.productsCategories")}
        </h2>
        <Link
          to={localizedPath("/categories")}
          className="button-with-icon-on-white-layout mt-4 flex h-14 items-center gap-2 rounded-2xl px-4 text-sm lg:mt-0"
          aria-label={t("categories.moreCategories")}
        >
          <span className="button-with-icon-on-white-layout__svg flex h-8 w-8 items-center justify-center rounded-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21 10L15 4M21 10H3M21 10L19.6431 16.7845C19.2692 18.6542 17.6275 20 15.7208 20H8.27922C6.37249 20 4.73083 18.6542 4.35689 16.7845L3 10M3 10L9 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={`button-with-icon-on-white-layout__span ${lang === "fa"
              ? "text-right  m-rtl"
              : "text-left  m-ltr"
              }`}
          >
            {t("categories.moreCategories")}
          </span>
        </Link>
      </header>

      {/* Slider */}
      <Swiper
        className="mt-5 rounded-2xl"
        slidesPerView={1}
        spaceBetween={24}
        loop
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          1024: { slidesPerView: 3 },
        }}
      >
        {categories.map((category) => {
          const localizedName = getLocalizedText(
            lang,
            category.name,
            category.nameEn
          );

          return (
            <SwiperSlide key={category.id}>
              <Link
                to={localizedPath(`/products?categoryIds=${category.id}`)}
                state={{ name: localizedName }}
                className="group relative flex h-36 flex-col justify-center rounded-2xl bg-color-for-layer-on-body p-4 transition-shadow hover:shadow-lg"
                aria-label={`${t("categories.viewMore")} ${localizedName}`}
              >
                <div className="mb-2 flex items-center w-full">
                  {category.image && (
                    <div className="relative h-8 w-8">
                      <img
                        src={category.image}
                        alt={localizedName}
                        loading="lazy"
                        width={32}
                        height={32}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <span className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-third/10" />
                    </div>
                  )}

                  <h3
                    className={`mr-1 truncate text-lg w-full ${lang === "fa"
                      ? "first-text-color text-right"
                      : "first-text-color text-left"
                      }`}
                  >
                    {localizedName}
                  </h3>
                </div>

                <p
                  className={`mt-1 text-sm gap-1 first-text-color-for-paragraph ${lang === "fa"
                    ? "first-text-color text-right"
                    : "first-text-color text-left flex flex-row-reverse"
                    }`}
                >
                  <span>
                    {category.productCount}
                  </span>{" "}
                  <span>
                    {t("categories.products")}
                  </span>
                </p>

                <span
                  className={`mt-2 flex items-center justify-between font-s-bold text-first ${lang === "fa"
                    ? " text-right"
                    : " text-left flex flex-row-reverse"
                    }`}
                >
                  {t("categories.viewMore")}
                  <div
                    className={` ${lang === "fa"
                      ? " rotate-0"
                      : " rotate-180"
                      }`}
                  >

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 12L17 12M7 12L11 8M7 12L11 16"
                        stroke="#1B9A9D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </span>
                <span className="absolute -bottom-1 left-0 right-0 mx-auto h-2 w-11/12 rounded-lg bg-secound opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section >
  );
};

export default ParentCategories;
