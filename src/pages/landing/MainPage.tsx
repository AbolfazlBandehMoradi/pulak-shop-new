import useIndex from '@/hooks/useIndex';
import useShowcases from '@/hooks/useShowcases';
import { Blogs } from '../blog/Blogs';
import ShowCasesComingSoon from '@/components/reusable-components/Showcases/ShowCasesComingSoon';
import ShowCasesNumberTwo from '@/components/reusable-components/Showcases/ShowCasesNumberTwo/ShowCasesNumberTwo';
import ShowCasesNumberThree from '@/components/reusable-components/Showcases/ShowCasesNumberThree/ShowCasesNumberThree';
import IndexLoading from '@/components/ui/IndexLoading';
import ApiError from '@/pages/error/ApiError';
import Hero from './sections/Hero';
import CategoriesSlider from './sections/CategoriesSlider';
import ProductSlider from './sections/ProductsSlider';

const MainPage = () => {
  const { data: index, isLoading, isError, refetch } = useIndex();
  const { data: showcases } = useShowcases();

  if (isLoading && !index) return <IndexLoading />;
  if (isError) {
    return <ApiError onRetry={refetch} />;
  }

  return (
    <main>
      <Hero />
      <CategoriesSlider categories={index?.categories ?? []} />
      <ProductSlider showCase={showcases && showcases[1]} />

      <ShowCasesComingSoon showCase={showcases && showcases[0]} />
      {/* <NewestProducts
        products={index?.newestProducts || []}
        loading={isLoading}
      /> */}
      <ShowCasesNumberTwo showCase={showcases && showcases[1]} />
      {/* <SpecificCategorySliderNumberTwo products={specificCategoryProducts2} /> */}
      <ShowCasesNumberThree showCase={showcases && showcases[2]} />
      {/* <SpecificCategorySliderNumberThree products={specificCategoryProducts3} /> */}
      <Blogs blogs={index?.blogs || []} loading={isLoading} />
    </main>
  );
};

export default MainPage;
