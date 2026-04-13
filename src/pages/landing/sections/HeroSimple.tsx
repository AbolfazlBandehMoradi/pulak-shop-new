import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import LeftSideImage from "@/assets/Images/Hero/1.png";
import Image4 from "@/assets/Images/Hero/4.png";
import Image5 from "@/assets/Images/Hero/5.png";
import Image6 from "@/assets/Images/Hero/6.png";
import Image7 from "@/assets/Images/Hero/2.png";
import PlusImage from "@/assets/Images/Hero/3.png";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLangStore } from "@/stores/languageStore";
const HeroSimple = () => {
  const { t } = useTranslation();
  const lang = useLangStore((s) => s.lang);
  const images = [Image4, Image5, Image6, Image7];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="mx-auto mt-20 lg:mt-8 px-4 sm:container">
      <div className="flex flex-wrap justify-between items-center w-full">
        <div className="w-full lg:w-22/96 relative h-80 sm:h-96 md:h-112 flex justify-center items-center overflow-hidden ">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt="GammaTebAsia"
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>
        </div>
        <div className="w-full lg:w-46/96 flex flex-col items-center">
          <div className="flex items-center ">
            <motion.div
              className="text-9xl font-bold text-first"
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              style={{
                perspective: 800,
              }}
            >
              <img
                className="w-full z-2 relative h-auto"
                src={PlusImage}
                alt="GammaTebAsia"
              />
            </motion.div>
          </div>
          <h1
            className={`font-s-bold  text-nowrap flex gap-1 text-third text-center text-lg 2xl:text-4xl ${lang === "fa"
              ? " "
              : "flex flex-row-reverse"
              }`}>
            <span>{t("hero.shopName")}</span>
            <span className="first-text-color inline-block">
              {t("hero.shopNameTwo")}
            </span>
          </h1>
          <p className="first-text-color-for-paragraph text-center my-4">
            {t("hero.caption")}
          </p>
          <div className=" w-full lg:w-24/96 mb-8 lg:mb-0 ">
            <Link
              to={'#why-us'}
              className="first-style-button-bg flex  justify-center  p-4 rounded-lg text-white transition-all duration-300"
            >
              {t("categories.viewMore")}
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-22/96 relative">
          <img
            className="w-full z-2 relative h-auto"
            src={LeftSideImage}
            alt="GammaTebAsia"
          />
          <span className="absolute bg-color-for-layer-on-body rounded-2xl h-full w-full right-4 bottom-4"></span>
        </div>

      </div>
    </div >
  );
};

export default HeroSimple;
