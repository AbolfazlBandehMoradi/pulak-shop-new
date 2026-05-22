import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, EffectCreative, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';
import slider1 from '@/assets/Images/Hero/slider-1.webp';
import slider2 from '@/assets/Images/Hero/slider-2.webp';
import slider3 from '@/assets/Images/Hero/slider-3.webp';
import type { GalleryItem } from '@/hooks/useGalleries';

interface HeroProps {
  slides?: GalleryItem[];
}

const Hero = ({ slides: gallerySlides = [] }: HeroProps) => {
  const { t } = useTranslation();
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(null);
  const slideTranslations = t('mainpage.hero.slides', {
    returnObjects: true,
  }) as Array<{ title: string }>;

  const fallbackSlides = [
    {
      image: slider1,
      title: slideTranslations?.[0]?.title ?? '',
      id: 'fallback-1',
    },
    {
      image: slider2,
      title: slideTranslations?.[1]?.title ?? '',
      id: 'fallback-2',
    },
    {
      image: slider3,
      title: slideTranslations?.[2]?.title ?? '',
      id: 'fallback-3',
    },
  ];

  const slides = gallerySlides.length
    ? gallerySlides.map((slide) => ({
        id: slide.id,
        image: slide.image,
        title: slide.altText || slide.title,
      }))
    : fallbackSlides;

  return (
    <section className="my-8 mx-auto px-4 relative">
      <div className="first-slider">
        <Swiper
          className="rounded-2xl"
          slidesPerView={1}
          effect="creative"
          spaceBetween={10}
          modules={[Thumbs, EffectCreative, Autoplay]}
          creativeEffect={{
            prev: {
              shadow: true,
              translate: [0, 0, -400],
            },
            next: {
              translate: ['100%', 0, 0],
            },
          }}
          thumbs={{ swiper: thumbsSwiper }}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="rounded-2xl">
              <img className="w-full h-auto object-cover" src={slide.image} alt={slide.title} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className='hidden lg:block after:content-[" _ "]'>
          <Swiper
            className="first-slider__thumb-slider mt-4"
            slidesPerView={4}
            spaceBetween={10}
            onSwiper={setThumbsSwiper}
            modules={[Thumbs]}
            watchSlidesProgress
          >
            {slides.map((slide) => (
              <SwiperSlide className="first-slider__thumb-slider-slider" key={slide.id}>
                <img
                  className="w-full h-full object-cover object-top-left aspect-square rounded-full"
                  src={slide.image}
                  alt={slide.title}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Hero;
