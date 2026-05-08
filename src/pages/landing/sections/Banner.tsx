import banner1 from '@/assets/images/Banner/1.png';
import banner2 from '@/assets/images/Banner/2.png';
const Banner = () => {
  return (
    <div className="sm:container mt-8 lg:mt-16 mx-auto px-4 relative ">
      <div className="w-full">
        <div className="flex justify-between flex-wrap gap-3 lg:gap-0">
          <div className="lg:w-23/48 w-full">
            <img className="w-full rounded-2xl object-cover" src={banner1} alt="banner 1" />
          </div>
          <div className="lg:w-23/48 w-full">
            <img className="w-full rounded-2xl object-cover" src={banner2} alt="banner 2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
