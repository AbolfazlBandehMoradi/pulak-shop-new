import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/IconButton';
import type { MediaFile } from '@/utils/shopApi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ProductGalleryProps {
  images: MediaFile[]; // ✅ اصلاح شد
  mainImage?: MediaFile;
  productName?: string;
  loading?: boolean;
  lang?: string;
}

export function ProductGallery({ images = [], mainImage, productName }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299';

  const getImageUrl = (filePath?: string) => {
    if (!filePath) return '';
    return filePath.startsWith('http') ? filePath : `${apiBaseUrl}${filePath}`;
  };

  // ✅ ساده و درست
  const displayImages = [...(mainImage ? [mainImage] : []), ...images].filter(
    (item, index, self) =>
      item?.filePath && index === self.findIndex((i) => i.filePath === item.filePath),
  );

  if (!displayImages.length) {
    return (
      <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        No image
      </div>
    );
  }
  const maxThumbs = 3;

  const visibleThumbs =
    displayImages.length > maxThumbs ? displayImages.slice(0, maxThumbs) : displayImages;

  const hasMoreThanThree = displayImages.length > maxThumbs;
  return (
    <>
      <div className="w-full  rounded-lg relative">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setSelectedIndex(swiper.activeIndex)}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          className="aspect-square w-full rounded-xl border border-gray-300 overflow-hidden"
        >
          {displayImages.map((img, index) => (
            <SwiperSlide key={img.id ?? index}>
              <div
                className="relative flex items-center justify-center cursor-zoom-in group h-full"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={getImageUrl(img.filePath)}
                  alt={productName || 'Product'}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {displayImages.length > 1 && (
          <div className="py-2">
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[FreeMode, Thumbs]}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              className="w-full"
            >
              {displayImages.map((img, index) => (
                <SwiperSlide key={img.id ?? index} style={{ width: 70 }}>
                  <div
                    onClick={() => mainSwiper?.slideTo(index)}
                    className={cn(
                      'w-16 h-16 rounded-md overflow-hidden cursor-pointer bg-color-for-layer-sec  transition',
                      selectedIndex === index
                        ? 'border-gray-300   '
                        : 'opacity-50 hover:opacity-100',
                    )}
                  >
                    <img src={getImageUrl(img.filePath)} className="w-full h-full object-cover " />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* MODAL BOX */}
            <motion.div
              className="relative w-full max-w-5xl h-[80vh] bg-black/95 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* IMAGE */}
              <img
                src={getImageUrl(displayImages[selectedIndex]?.filePath)}
                className="max-w-full max-h-full object-contain select-none cursor-zoom-in"
                style={{
                  transform: isZoomed ? 'scale(2)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
                onDoubleClick={() => setIsZoomed(!isZoomed)}
              />

              {/* PREV */}
              {displayImages.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                    onClick={() => {
                      const prev =
                        selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1;
                      setSelectedIndex(prev);
                      setIsZoomed(false);
                    }}
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  {/* NEXT */}
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                    onClick={() => {
                      const next =
                        selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1;
                      setSelectedIndex(next);
                      setIsZoomed(false);
                    }}
                  >
                    <ChevronLeftIcon className="w-6 h-6 rotate-180" />
                  </button>

                  {/* COUNTER */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded-full text-sm">
                    {selectedIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
