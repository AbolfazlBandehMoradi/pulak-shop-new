import { Swiper, SwiperSlide } from 'swiper/react';
import React from 'react';
import { Thumbs, EffectCreative, Autoplay } from 'swiper/modules';
import 'swiper/swiper.css';
import slider1 from '@/assets/Images/Hero/slider-1.webp';
import slider2 from '@/assets/Images/Hero/slider-2.webp';
import slider3 from '@/assets/Images/Hero/slider-3.webp';
import type { Swiper as SwiperType } from 'swiper';

const Hero = () => {
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(null);
  const slides = [
    {
      image: slider1,
      title: 'تحویل فوری از بهشت زیبایی پولک',
    },
    {
      image: slider2,
      title: "محصولات آرایشی و بهداشتی بهشت زیبایی پولک"
    },
    {
      image: slider3,
      title: 'محصولات تخصصی بهشت زیبایی پولک',
    },
  ];
  return (
    <section className="sm:container my-8  mx-auto px-4 relative">
      <div className="first-slider">
        <Swiper
          className="rounded-2xl"
          slidesPerView={1}
          effect={'creative'}
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
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
                <img
                  className="w-full h-full object-cover"
                  src={slide.image}
                  alt={slide.title}
                />
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
            {slides.map((slide, idx) => (
              <SwiperSlide className="first-slider__thumb-slider-slider" key={idx}>
                  <img
                    className="w-full h-full object-cover object-top-left  aspect-square rounded-full"
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
