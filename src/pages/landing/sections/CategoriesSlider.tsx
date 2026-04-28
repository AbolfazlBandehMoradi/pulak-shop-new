import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper.css";
import { SwiperSlide, Swiper } from "swiper/react";
import { Category } from "@/types";

interface Props {
  categories: Category[];
}

const CategoriesSlider = ({ categories }: Props) => {
  const [isInView, setIsInView] = useState(false);
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <motion.section
      className="all-categories mx-auto mt-8 lg:mt-16 px-4 sm:container"
      ref={sectionRef}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-color-for-layer-on-body rounded-3xl p-6">
        <motion.div
          className="flex w-full flex-wrap items-center justify-between lg:w-full xl:w-full 2xl:w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: 0.2,
          }}
        >
          <div className="flex w-full items-center  lg:w-6/12">
            <span className="first-text-color-svg inline-block rounded-lg p-3">
              <svg
                className="h-6 w-6 lg:h-16 lg:w-16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 8H16M8 12H16M8 16H12M3.5 12C3.5 5.5 5.5 3.5 12 3.5C18.5 3.5 20.5 5.5 20.5 12C20.5 18.5 18.5 20.5 12 20.5C5.5 20.5 3.5 18.5 3.5 12Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="font-s-sbold first-text-color text-2xl">
                <span className="text-first me-3 inline-block">دسته</span>
                محصولات
              </h2>
              <p className="first-text-color-for-paragraph mt-2 text-base text-nowrap">
                دسته بندی محصولات جهت دسترسی آسان
              </p>
            </div>
          </div>
          <div className="mt-4 flex w-full lg:mt-0 lg:w-6/12 lg:flex-row-reverse">
            <Link
              className="button-with-icon-on-white-layout   text-sm flex items-center h-14 px-4 rounded-2xl gap-2"
              to="/categories"
            >
              <span className="button-with-icon-on-white-layout__svg h-8 flex justify-center items-center rounded-full w-8">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
              <span className="button-with-icon-on-white-layout__span">
                دسته بندی های بیشتر ...
              </span>
            </Link>
          </div>
        </motion.div>
        <div className="relative mt-4">
          {categories?.length > 0 ? (
            <Swiper
              className="mt-5 rounded-2xl"
              slidesPerView={1}
              spaceBetween={24}
              loop={true}
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              pagination={{
                clickable: true,
                renderBullet: (index: number, className: string) => {
                  if (index < 4) {
                    return `<span class="${className}"></span>`;
                  }
                  return "";
                },
              }}
              initialSlide={Math.floor(categories.length / 1)} // اسلاید وسطی
              breakpoints={{
                640: { slidesPerView: 1 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
                1420: { slidesPerView: 6 },
                1536: { slidesPerView: 6 },
              }}
            >
              {categories.map((category, index) => (
                <SwiperSlide key={category.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                    }}
                  >
                    <div
                      className=" my-4 flex h-72 cursor-pointer flex-col items-center justify-center rounded-2xl p-4"
                      onClick={() =>
                        navigate(`products?categoryIds=${category.id}`, {
                          state: { name: category.name },
                        })
                      }
                    >
                      <div className="flex  h-50 w-50 relative ">
                        {category.image && (
                          <img
                            src={`${category.image}`}
                            className="h-full w-full z-1 object-cover"
                            alt={category.name}
                          />
                        )}
                        <span className="bg-color-for-layer-three absolute h-6 inset-0 rounded-full top-40"></span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <h3 className="font-s-bold  text-nowrap first-text-color  text-base 2xl:text-lg">
                          {category.name}
                        </h3>
                        <p className=" first-text-color-for-paragraph mt-1 flex items-center justify-center rounded-sm  text-sm">
                          <span className="inline-block text-center text-sm">
                            <span className="me-1 inline-block">
                              {category.productCount}
                            </span>
                            کالا
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <motion.p
              className="text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            >
              هیچ دسته‌بندی‌ای یافت نشد.
            </motion.p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CategoriesSlider;
