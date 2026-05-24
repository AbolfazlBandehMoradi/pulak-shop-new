import { useInView } from '@/hooks/useInView';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';

interface Props {
  categories: Category[];
}

const CategoriesSlider = ({ categories }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ref, isVisible } = useInView<HTMLDivElement>();

  return (
    <motion.section
      className="all-categories mx-auto mt-8 lg:mt-16 px-4 sm:container"
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="bg-color-for-layer-on-body rounded-3xl p-6">
        <motion.div
          className="flex w-full flex-wrap items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
            delay: 0.2,
          }}
        >
          <div className="flex items-center justify-between w-full ">
            <div>
              <h2 className="font-s-sbold first-text-color text-base sm:text-xl">
                {t('mainpage.categories.titlePrefix') && (
                  <span>{t('mainpage.categories.titlePrefix')} </span>
                )}
                <span className="text-first me-1 inline-block">
                  {t('mainpage.categories.titleAccent')}
                </span>
                {t('mainpage.categories.titleSuffix')}
              </h2>
              <p className=" hidden md:flex first-text-color-for-paragraph mt-2 text-sm sm:text-base">
                {t('mainpage.categories.description')}
              </p>
            </div>
            <Link
              className="button-with-icon-on-white-layout text-sm flex items-center h-10 sm:h-14 px-4 rounded-lg sm:rounded-2xl  gap-2 w-fit"
              to="/categories"
            >
              <span className=" hidden sm:flex button-with-icon-on-white-layout__span">
                {t('mainpage.categories.more')}
              </span>
              <span className="flex sm:hidden button-with-icon-on-white-layout__span">
                {t('mainpage.categories.moreInPhone')}
              </span>
              <span className="h-5 flex justify-center items-center sm:rounded-full w-5">
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
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                renderBullet: (index: number, className: string) => {
                  if (index < 4) {
                    return `<span class="${className}"></span>`;
                  }
                  return '';
                },
              }}
              initialSlide={Math.floor(categories.length / 1)}
              breakpoints={{
                300: { slidesPerView: 1 },
                400: { slidesPerView: 2 },
                500: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
                1420: { slidesPerView: 6 },
                1536: { slidesPerView: 7 },
              }}
            >
              {categories.map((category, index) => (
                <SwiperSlide key={category.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                    }}
                  >
                    <div
                      className="mb-4 flex group hover:border-first hover:border-2 h-60 border border-gray-100 dark:border-gray-900 cursor-pointer flex-col items-center justify-center rounded-2xl p-4"
                      onClick={() =>
                        navigate(`products?categoryIds=${category.id}`, {
                          state: { name: category.name },
                        })
                      }
                    >
                      <div className="flex h-30 flex-wrap w-30 relative">
                        {category.image && (
                          <img
                            src={category.image}
                            className="h-full w-full z-1 object-cover"
                            alt={category.name}
                          />
                        )}
                        <span className="w-full h-full rounded-full absolute group-hover:opacity-100 opacity-20 bg-color-for-layer-sec"></span>
                      </div>
                      <div className="flex flex-col items-center mt-2 justify-center">
                        <h3 className="font-s-medium first-text-color text-base text-center line-clamp-2 2xl:text-lg">
                          {category.name}
                        </h3>
                        <p className="first-text-color-for-paragraph-low px-2 py-0.5 mt-1 flex items-center justify-center  text-xs">
                          <span className="inline-block text-center text-xs">
                            <span className="me-1 inline-block">{category.productCount}</span>
                            {t('mainpage.categories.productCountSuffix')}
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
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            >
              {t('mainpage.categories.empty')}
            </motion.p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CategoriesSlider;
