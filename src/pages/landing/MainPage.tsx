import ParentCategories from '@/components/reusable-components/ParentCategories/ParentCategories';
import { SpecificCategorySlider } from '@/components/reusable-components/SpecificCategoryProducts/SpecificCategorySlider';
import useIndex from '@/hooks/useIndex';
import useShowcases from '@/hooks/useShowcases';
import useSpecificCategoryProducts from '@/hooks/useSpecificCategoryProducts';
import HeroSimple from '@/pages/landing/sections/HeroSimple';
import { Blogs } from '../blog/Blogs';
import ShowCasesComingSoon from '@/components/reusable-components/Showcases/ShowCasesComingSoon';
import { DiscountProductsSliderStatic } from '@/components/reusable-components/DiscountProducts/DiscountProductsSliderStatic';
import WhyUs from './sections/WhyUs';
import ShowCasesNumberTwo from '@/components/reusable-components/Showcases/ShowCasesNumberTwo/ShowCasesNumberTwo';
import ShowCasesNumberThree from '@/components/reusable-components/Showcases/ShowCasesNumberThree/ShowCasesNumberThree';
import IndexLoading from '@/components/ui/IndexLoading';
import ApiError from '@/pages/error/ApiError';

const MainPage = () => {
  const { data: index, isLoading, isError, refetch } = useIndex();
  const { data: showcases } = useShowcases();
  const { data: specificCategoryProducts } = useSpecificCategoryProducts(10, 'محصولات بهداشتی');

  if (isLoading && !index) return <IndexLoading />;
  if (isError) {
    return <ApiError onRetry={refetch} />;
  }

  return (
    <main>
      <HeroSimple />
      {/* <AllCategoriesIndex categories={index?.categories ?? []} /> */}
      <ParentCategories categories={index?.categories ?? []} />
      <SpecificCategorySlider products={specificCategoryProducts} />
      <ShowCasesComingSoon showCase={showcases && showcases[0]} />
      {/* TODO: discount products slider   */}
      <DiscountProductsSliderStatic products={index?.discountProducts || []} loading={isLoading} />
      {/* <NewestProducts
        products={index?.newestProducts || []}
        loading={isLoading}
      /> */}
      <ShowCasesNumberTwo showCase={showcases && showcases[1]} />
      <WhyUs />
      {/* <SpecificCategorySliderNumberTwo products={specificCategoryProducts2} /> */}
      <ShowCasesNumberThree showCase={showcases && showcases[2]} />
      {/* <SpecificCategorySliderNumberThree products={specificCategoryProducts3} /> */}
      <Blogs blogs={index?.blogs || []} loading={isLoading} />
    </main>
  );
};

export default MainPage;
