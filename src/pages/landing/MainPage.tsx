import useIndex from '@/hooks/useIndex';
import useShowcases from '@/hooks/useShowcases';
import IndexLoading from '@/components/ui/IndexLoading';
import ApiError from '@/pages/error/ApiError';
import Hero from './sections/Hero';
import CategoriesSlider from './sections/CategoriesSlider';
import ProductSlider from './sections/ProductsSlider';
import "./MainPage.css"
import NewBlogs from './sections/NewBlogs';
import ProductsSliderTwo from './sections/ProductsSliderTwo';
import Banner from './sections/Banner';
import WhyUs from './sections/WhyUs';
import ShowCasesNumberTwo from '@/pages/landing/sections/ShowCasesNumberTwo/ShowCasesNumberTwo';
import DiscountedProducts from './sections/DiscountedProducts';
import BestProducts from './sections/BestProducts';

const MainPage = () => {
  const { data: index, isLoading, isError, refetch } = useIndex();
  const { data: showcases } = useShowcases();

  if (isLoading && !index) return <IndexLoading />;
  if (isError) {
    return <ApiError onRetry={refetch} />;
  }

  return (
    <main className='pb-10'>
      <Hero />
      <CategoriesSlider categories={index?.categories ?? []} />
      <ProductSlider showCase={showcases && showcases[0]} />
      <section className="sm:container mx-auto mt-8 lg:mt-16 px-4 ">
        <div className="flex h-full flex-wrap lg:flex-nowrap justify-between">
          <div className="w-full  lg:w-31/48 xl:w-35/48 xxl:w-36/48 ">
            <div className="h-full rounded-2xl bg-color-for-layer-on-body">
              <DiscountedProducts discountedProduct={index?.discountProducts ?? []} />
            </div>
          </div>
          <aside className="w-full   lg:w-16/48 xl:w-12/48 xxl:w-11/48">
            <div className="h-full rounded-2xl bg-color-for-layer-on-body">
              <BestProducts showcase={showcases && showcases[3]}
              />
            </div>
          </aside>
        </div>
      </section>
      <NewBlogs blogs={index?.blogs ?? []} />
      <ProductsSliderTwo showcase={showcases && showcases[1]} />
      <Banner />
      <WhyUs />
      <ShowCasesNumberTwo showCase={showcases && showcases[2]} />
    </main>
  );
};

export default MainPage;
