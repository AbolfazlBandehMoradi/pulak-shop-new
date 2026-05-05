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
      <NewBlogs blogs={index?.blogs ?? []} />
      <ProductsSliderTwo showcase={showcases && showcases[1]} />
      <Banner />
      <WhyUs />
      <ShowCasesNumberTwo showCase={showcases && showcases[2]} />
    </main>
  );
};

export default MainPage;
