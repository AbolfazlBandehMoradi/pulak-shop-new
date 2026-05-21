import banner1 from '@/assets/images/Banner/1.png';
import banner2 from '@/assets/images/Banner/2.png';
import { useTranslation } from 'react-i18next';

const Banner = () => {
  const { t } = useTranslation();

  return (
    <div className="sm:container mt-8 lg:mt-16 mx-auto px-4 relative ">
      <div className="w-full">
        <div className="flex justify-between flex-wrap gap-3 lg:gap-0">
          <div className="lg:w-23/48 w-full">
            <img className="w-full rounded-2xl object-cover" src={banner1} alt={t('mainpage.banner.firstAlt')} />
          </div>
          <div className="lg:w-23/48 w-full">
            <img className="w-full rounded-2xl object-cover" src={banner2} alt={t('mainpage.banner.secondAlt')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
