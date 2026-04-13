import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";

export const FilterItemsSkeleton = ({ rows = 7 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={`filter-row-${index}`} className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-gray-200 rounded-sm" />
        <Skeleton className="h-4 flex-1 bg-gray-200" />
      </div>
    ))}
  </div>
);

export const FilterPanelSkeleton = () => (
  <div className="bg-color-for-layer-on-body rounded-lg p-4 sticky top-4">
    <div className="flex justify-between mb-4">
      <Skeleton className="h-6 w-28 bg-gray-200" />
      <Skeleton className="h-4 w-16 bg-gray-200" />
    </div>
    <Skeleton className="h-5 w-full bg-gray-200 mb-4" />
    <FilterItemsSkeleton />
  </div>
);

export const GridProductsSkeleton = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={`grid-skeleton-${index}`} />
    ))}
  </div>
);

export const ListProductsSkeleton = ({ count }: { count: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={`list-skeleton-${index}`} className="flex gap-6 p-4 rounded-2xl bg-gray-100">
        <Skeleton className="w-40 h-40 bg-gray-200 rounded-xl shrink-0" />
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-4/5 bg-gray-200" />
            <Skeleton className="h-4 w-16 bg-gray-200" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28 bg-gray-200" />
            <Skeleton className="h-10 w-10 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ProductsContentSkeleton = ({
  viewMode,
  count,
}: {
  viewMode: 'grid' | 'list';
  count: number;
}) => {
  if (viewMode === 'grid') {
    return <GridProductsSkeleton count={count} />;
  }

  return <ListProductsSkeleton count={count} />;
};