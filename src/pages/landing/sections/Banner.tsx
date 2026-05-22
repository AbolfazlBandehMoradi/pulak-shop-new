import banner1 from '@/assets/Images/Banner/1.png';
import banner2 from '@/assets/Images/Banner/2.png';
import type { GalleryItem } from '@/hooks/useGalleries';
import { useTranslation } from 'react-i18next';

interface BannerProps {
  banners?: GalleryItem[];
}

const Banner = ({ banners: galleryBanners = [] }: BannerProps) => {
  const { t } = useTranslation();
  const fallbackBanners = [
    {
      id: 'fallback-1',
      image: banner1,
      altText: t('mainpage.banner.firstAlt'),
    },
    {
      id: 'fallback-2',
      image: banner2,
      altText: t('mainpage.banner.secondAlt'),
    },
  ];

  const banners = galleryBanners.length
    ? galleryBanners.map((banner) => ({
        id: banner.id,
        image: banner.image,
        altText: banner.altText || banner.title,
      }))
    : fallbackBanners;

  return (
    <div className="sm:container mt-8 lg:mt-16 mx-auto px-4 relative ">
      <div className="w-full">
        <div className="flex justify-between flex-wrap gap-3 lg:gap-0">
          {banners.slice(0, 2).map((banner) => (
            <div className="lg:w-23/48 w-full" key={banner.id}>
              <img className="w-full rounded-2xl object-cover" src={banner.image} alt={banner.altText} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
