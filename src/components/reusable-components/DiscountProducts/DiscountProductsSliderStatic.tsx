import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { DiscountProductCardStatic } from "./DiscountProductCardStatic";
import bgForDiscount from "@/assets/Images/static/Background/bg-for-discount.png";
import img1 from "@/assets/Images/static/Animation/1.png";
import img2 from "@/assets/Images/static/Animation/2.png";
import img3 from "@/assets/Images/static/Animation/3.png";
import img4 from "@/assets/Images/static/Animation/4.png";
import img5 from "@/assets/Images/static/Animation/5.png";
import video1 from "@/assets/video/1.mp4";
import { FaPlay } from "react-icons/fa6";
const images = [img1, img2, img3, img4, img5];

const CountdownBox: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => (
  <div className="flex flex-col items-center">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-rose-100 dark:border-rose-900/30 flex items-center justify-center">
      <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
    <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-1 font-medium uppercase tracking-wider">
      {label}
    </span>
  </div>
);

interface DiscountProductsProps {
  products?: Product[];
  loading?: boolean;
}

export const DiscountProductsSliderStatic: React.FC<DiscountProductsProps> = ({
  products = [],
  loading = false,
}) => {
  const [index, setIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000); // هر 3 ثانیه
    return () => clearInterval(interval);
  }, []);

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Filter products with discount
  const discountProducts = loading
    ? []
    : products.filter((p) => p.discount && p.discount > 0).slice(0, 4);

  // Mock Countdown Logic
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // گرفتن فریم ثانیه 7 برای پیش‌نمایش
  useEffect(() => {
    const video = document.createElement("video");
    video.src = video1;
    video.crossOrigin = "anonymous";

    video.addEventListener("loadedmetadata", () => {
      if (video.duration > 7) video.currentTime = 7;
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/png");
        setThumbnail(dataURL);
      }
    });
  }, []);
  useEffect(() => {
    if (isVideoOpen) {
      // اسکرول بدن رو بگیر
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = ""; // مطمئن شدن از برگشت اسکرول
    };
  }, [isVideoOpen]);
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgForDiscount})` }}
    >
      <div className="sm:container mx-auto py-16 my-8 px-4">
        <div className="flex flex-wrap justify-between items-center">
          {/* بخش محصولات تخفیف دار */}
          <div className="w-40/96">
            {/* {discountProducts.map((product) => (
              <div className="relative z-40" key={product.id}>
                <DiscountProductCardStatic
                  product={product}
                  onLinkHover={() => { }}
                />
              </div>
            ))} */}
            <div className="relative z-40" >
              <DiscountProductCardStatic />
            </div>
          </div>

          {/* کامنت شده اسلایدر تصاویر */}
          {/*
          <div className="w-40/96">
            <div className="relative w-full h-80 overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={index}
                  src={images[index]}
                  alt="discount product"
                  className="absolute inset-0 w-full h-full  object-contain"
                  initial={{ opacity: 0, scale: 1.2, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -50 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </div>
          */}

          {/* کارت ویدئو با فریم ثانیه 7 */}
          <div className="w-40/96">
            <div
              className="relative w-full h-120 overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => setIsVideoOpen(true)}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="ویدئو پیش‌نمایش"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
              )}
              <button className="relative flex justify-center items-center w-12 h-12 rounded-full right-1/2 top-1/2  translate-x-1/2 -translate-y-1/2 z-10 bg-first   text-white font-medium hover:bg-first-600 transition">
                <FaPlay />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* مودال ویدئو ساده و شیک */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {/* کانتینر انیمیشنی */}
          <div className="relative w-full max-w-3xl mx-4 sm:mx-0 bg-black rounded-2xl shadow-2xl overflow-hidden transform scale-95 opacity-0 animate-scaleFadeIn">
            {/* دکمه بستن */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-50 bg-third hover:bg-secound text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300"
            >
              x
            </button>

            <video
              className="w-full h-auto max-h-[80vh] object-contain rounded-b-2xl"
              src={video1}
              autoPlay
              controls
              loop
            />
          </div>
        </div>
      )}


    </section>
  );
};
