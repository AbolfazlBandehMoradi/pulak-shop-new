import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/IconButton';
import type { ProductImage, MediaFile } from '@/utils/shopApi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

interface ProductGalleryProps {
  images: ProductImage[];
  mainImage?: MediaFile;
  productName?: string;
  loading?: boolean;
  lang?: string;
}

export function ProductGallery({
  images,
  mainImage,
  productName,
  loading,
  lang,
}: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299';

  const getImageUrl = (filePath?: string) => {
    if (!filePath) return null;
    return filePath.startsWith('http') ? filePath : `${apiBaseUrl}${filePath}`;
  };

  const displayImages = useMemo(() => {
    const result: MediaFile[] = [];
    if (mainImage) {
      const exists = images.some(
        (img) =>
          img.mediaFile?.id === mainImage.id || img.mediaFile?.filePath === mainImage.filePath,
      );
      if (!exists) result.push(mainImage);
    }
    images.forEach((img) => {
      if (img.mediaFile) result.push(img.mediaFile);
    });
    return result;
  }, [images, mainImage]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex gap-2 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 shrink-0 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!displayImages.length) {
    return (
      <div className="aspect-square bg-muted dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground dark:text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-color-for-layer-sec rounded-lg relative">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setSelectedIndex(swiper.activeIndex)}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          className="aspect-square rounded-lg overflow-hidden"
        >
          {displayImages.map((img, index) => {
            const imageUrl = getImageUrl(img.filePath);
            if (!imageUrl) return null;

            return (
              <SwiperSlide key={img.id ?? index}>
                <div
                  className="relative aspect-square flex items-center justify-center cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={imageUrl}
                    alt={img.alt || productName || 'Product image'}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="h-8 w-8 text-third" />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {displayImages.length > 1 && (
          <div className="px-4 pb-2 bg-color-for-layer-sec">
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[FreeMode, Thumbs]}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              className="p-4"
            >
              {displayImages.map((img, index) => {
                const thumbUrl = getImageUrl(img.filePath);
                if (!thumbUrl) return null;

                return (
                  <SwiperSlide key={img.id ?? index} style={{ width: '70px' }}>
                    <div
                      className={cn(
                        'w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all',
                        selectedIndex === index
                          ? 'p-1 border-2 border-first'
                          : 'border-transparent',
                      )}
                      onClick={() => mainSwiper?.slideTo(index)}
                    >
                      <img
                        src={thumbUrl}
                        alt={img.alt || `${productName} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

        {/* Custom Prev/Next Buttons */}
        {displayImages.length > 1 && (
          <>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white"
              onClick={() => {
                const newIndex = selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1;
                setSelectedIndex(newIndex);
                mainSwiper?.slideTo(newIndex);
                setIsZoomed(false);
              }}
            >
              <ChevronLeftIcon
                className={cn(
                  'h-4 w-4 sm:h-5 sm:w-5 first-text-color-svg',
                  lang === 'fa' ? 'rotate-180' : 'rotate-180',
                )}
              />
            </button>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white"
              onClick={() => {
                const newIndex = selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1;
                setSelectedIndex(newIndex);
                mainSwiper?.slideTo(newIndex);
                setIsZoomed(false);
              }}
            >
              <ChevronLeftIcon
                className={cn(
                  'h-4 w-4 sm:h-5 sm:w-5 first-text-color-svg',
                  lang === 'fa' ? 'rotate-0' : 'rotate-0',
                )}
              />
            </button>
          </>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageUrl(displayImages[selectedIndex]?.filePath) || ''}
                className="max-w-full max-h-full object-contain"
                style={{ transform: isZoomed ? 'scale(2)' : 'scale(1)' }}
                onDoubleClick={() => setIsZoomed(!isZoomed)}
              />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 text-white hover:bg-white/20"
                    onClick={() => {
                      const newIndex =
                        selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1;
                      setSelectedIndex(newIndex);
                      mainSwiper?.slideTo(newIndex);
                      setIsZoomed(false);
                    }}
                  >
                    <ChevronLeftIcon
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5 first-text-color-svg shrink-0',
                        lang === 'fa' ? 'rotate-0' : 'rotate-0',
                      )}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 text-white hover:bg-white/20"
                    onClick={() => {
                      const newIndex =
                        selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1;
                      setSelectedIndex(newIndex);
                      mainSwiper?.slideTo(newIndex);
                      setIsZoomed(false);
                    }}
                  >
                    <ChevronLeftIcon
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5 first-text-color-svg shrink-0',
                        lang === 'fa' ? 'rotate-180' : 'rotate-180',
                      )}
                    />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
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
