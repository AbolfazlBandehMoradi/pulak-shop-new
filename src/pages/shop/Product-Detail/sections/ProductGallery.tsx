import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, X, ZoomIn } from 'lucide-react';
import { FreeMode, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { cn } from '@/utils/cn';
import type { MediaFile } from '@/utils/shopApi';
import { useTranslation } from '@/i18n/useTranslation';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';
interface ProductGalleryProps {
  images: MediaFile[];
  mainImage?: MediaFile;
  productName?: string;
  loading?: boolean;
  lang?: string;
}

function translate(t: (key: string) => string, key: string, fallback: string): string {
  const value = t(key);
  return value === key ? fallback : value;
}

export function ProductGallery({ images = [], mainImage, productName }: ProductGalleryProps) {
  const { t } = useTranslation();
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

  const displayImages = [...(mainImage ? [mainImage] : []), ...images].filter(
    (item, index, self) =>
      item?.filePath && index === self.findIndex((image) => image.filePath === item.filePath),
  );
  const imageAlt = productName || translate(t, 'productDetail.gallery.imageAlt', 'Product image');

  const goToImage = (index: number) => {
    setSelectedIndex(index);
    mainSwiper?.slideTo(index);
    setIsZoomed(false);
  };

  const goToPrevious = () => {
    if (!displayImages.length) return;
    goToImage(selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (!displayImages.length) return;
    goToImage(selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
        setIsZoomed(false);
        return;
      }

      if (displayImages.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        setSelectedIndex((currentIndex) => {
          const nextIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
          mainSwiper?.slideTo(nextIndex);
          return nextIndex;
        });
        setIsZoomed(false);
      }

      if (event.key === 'ArrowRight') {
        setSelectedIndex((currentIndex) => {
          const nextIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
          mainSwiper?.slideTo(nextIndex);
          return nextIndex;
        });
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayImages.length, isLightboxOpen, mainSwiper]);

  if (!displayImages.length) {
    return (
      <div className="product-detail-panel flex aspect-[4/3] items-center justify-center p-6 text-center first-text-color-for-paragraph sm:aspect-square">
        {translate(t, 'productDetail.gallery.noImage', 'No image')}
      </div>
    );
  }

  return (
    <>
      <div className="product-detail-panel relative mx-auto w-full overflow-hidden p-2 sm:p-3 lg:sticky lg:top-24">
        <div className="relative overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--bg-color-for-layer-sec)_82%,var(--bg-color-for-layer-on-body))]">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => setSelectedIndex(swiper.activeIndex)}
            thumbs={{
              swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            className="aspect-[4/3] w-full sm:aspect-[5/4] xl:aspect-square"
          >
            {/* دقت کنید slice(0, 1) حذف شده و همه تصاویر رندر می‌شوند */}
            {displayImages.map((img, index) => (
              <SwiperSlide key={img.id ?? index}>
                <button
                  type="button"
                  className="product-detail-focus group relative flex h-full w-full cursor-zoom-in items-center justify-center"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label={translate(t, 'productDetail.gallery.openImage', 'Open product image')}
                >
                  <img
                    src={getImageUrl(img.filePath)}
                    alt={imageAlt}
                    width={900}
                    height={900}
                    className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03] sm:p-7"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 40vw, calc(100vw - 2rem)"
                  />
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--bg-color-for-layer-on-body)_92%,transparent)] text-first shadow-[0_12px_24px_-18px_rgba(20,29,38,0.8)]">
                    <ZoomIn className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {displayImages.length > 1 && (
          <div className="w-full pt-3">
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[FreeMode, Thumbs]}
              direction="horizontal"
              spaceBetween={8}
              slidesPerView="auto"
              freeMode
              watchSlidesProgress
              className="w-full"
            >
              {displayImages.map((img, index) => (
                <SwiperSlide key={img.id ?? index} className="!w-auto">
                  <button
                    type="button"
                    onClick={() => goToImage(index)} // <--- کلیک برای تغییر عکس بالا
                    className={cn(
                      'product-detail-focus h-[4.25rem] w-[4.25rem] cursor-pointer overflow-hidden rounded-md border bg-color-for-layer-sec p-1 transition',
                      selectedIndex === index
                        ? 'border-secound opacity-100 ring-2 ring-secound/35'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <img
                      src={getImageUrl(img.filePath)}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={imageAlt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex h-[80vh] w-full max-w-5xl items-center justify-center overflow-hidden rounded-lg bg-black/95"
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                aria-label={translate(t, 'common.close', 'Close')}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={getImageUrl(displayImages[selectedIndex]?.filePath)}
                alt={imageAlt}
                width={1200}
                height={1200}
                decoding="async"
                className="max-h-full max-w-full cursor-zoom-in select-none object-contain"
                style={{
                  transform: isZoomed ? 'scale(2)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
                onDoubleClick={() => setIsZoomed(!isZoomed)}
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label={translate(
                      t,
                      'productDetail.related.previousProducts',
                      'Previous image',
                    )}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className={cn('h-6 w-6')} />
                  </button>

                  <button
                    type="button"
                    aria-label={translate(t, 'productDetail.related.nextProducts', 'Next image')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    onClick={goToNext}
                  >
                    <ChevronLeft className={cn('h-6 w-6 rotate-180')} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
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
