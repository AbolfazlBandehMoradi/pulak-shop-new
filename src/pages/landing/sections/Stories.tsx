import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Story as StoryInterface } from '@/types/index';
import 'swiper/swiper.css';
import cleanText from '@/utils/cleanText';

interface Props {
  stories: StoryInterface[];
}

const Story = ({ stories }: Props) => {
  const [isVideoOpen, setIsVideoOpen] = useState<number | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isVideoOpen !== null ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVideoOpen]);

  const toggleVideo = (index: number) => {
    if (isVideoOpen === index) {
      setIsVideoOpen(null);
      setSelectedVideoUrl(null);
    } else {
      const story = stories?.[index];
      if (story) {
        setIsVideoOpen(index);
        setSelectedVideoUrl(story.videoUrl);
      } else {
        console.warn('Invalid index for story:', index);
      }
    }
  };

  return (
    <>
      <section className="relative  sm:container mx-auto overflow-hidden px-4 ">
        <div className="pointer-events-none absolute left-4 top-0 z-10 h-full w-20 bg-linear-to-r from-[#f2f6fc] dark:from-[#101010] to-transparent" />
        <div className="pointer-events-none absolute right-4 top-0 z-10 h-full w-20 bg-linear-to-r to-[#f2f6fc] dark:to-[#101010] from-transparent" />
        <div className="relative flex flex-wrap justify-between">
          <Swiper
            loop={true}
            spaceBetween={20}
            speed={10000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            modules={[Navigation, Autoplay]}
            breakpoints={{
              300: { slidesPerView: 3.5 },
              500: { slidesPerView: 4.5 },
              640: { slidesPerView: 5.5 },
              768: { slidesPerView: 6.5 },
              1024: { slidesPerView: 7.5 },
              1280: { slidesPerView: 8.5 },
              1536: { slidesPerView: 9.5 },
              1792: { slidesPerView: 12.5 },
            }}
          >
            {stories?.map((story, index) => (
              <SwiperSlide
                className="cursor-pointer"
                key={story?.id || index}
                onClick={() => toggleVideo(index)}
              >
                <div className="flex flex-col items-center">
                  <div className="relative p-3">
                    <div className="rounded-full p-0.5 bg-linear-to-tr from-violet-500 via-fuchsia-500 to-orange-400">
                      <div className="rounded-full bg-white dark:bg-black p-1">
                        <img
                          src={story.image}
                          alt={story?.title}
                          className="h-15 w-15 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link className="font-s-light first-text-color text-xs" to="#">
                      مشاهده
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      {isVideoOpen !== null && selectedVideoUrl && stories?.[isVideoOpen] && (
        <div
          className="fixed inset-0 z-99 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsVideoOpen(null)}
        >
          <div
            className="smartphone relative m-auto h-40/48 w-40/48 rounded-[24px] border-[16px] border-t-[60px] border-b-[60px] border-solid border-[var(--color-1f2633-const)] sm:h-38/48 sm:w-30/48 md:h-38/48 md:w-24/48 lg:h-38/48 lg:w-20/48 xl:h-38/48 xl:w-14/48 2xl:h-38/48 2xl:w-12/48"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-color-for-layer-on-body h-full w-full">
              <iframe
                className="h-[254px] w-full overflow-hidden"
                src={selectedVideoUrl}
                allowFullScreen
                frameBorder="0"
              />
              <div className="p-2">
                <h3 className="font-s-bold first-text-color">{stories[isVideoOpen].title}</h3>
                <p className="mt-2 first-text-color-for-paragraph text-sm">
                  {cleanText(stories[isVideoOpen].caption.slice(0, 450))}
                </p>
                <div className="absolute bottom-1 flex w-11/12 justify-between">
                  <button className="bg-first w-5/12 cursor-pointer rounded-xl text-white">
                    خرید
                  </button>
                  <button
                    className="w-5/12 cursor-pointer rounded-xl border-2 border-red-500 py-2 text-red-500"
                    onClick={() => setIsVideoOpen(null)}
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Story;
