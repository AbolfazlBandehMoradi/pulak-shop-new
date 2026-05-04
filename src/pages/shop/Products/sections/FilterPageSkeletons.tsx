import { Skeleton } from "@/components/ui/skeleton";

export const FilterItemsSkeleton = ({ rows = 7 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={`filter-row-${index}`} className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-sm bg-first-100" />
        <Skeleton className="h-4 flex-1 bg-first-100" />
      </div>
    ))}
  </div>
);

export const FilterPanelSkeleton = () => (
  <div className="sticky top-4 rounded-lg border border-first-100/70 bg-color-for-layer-on-body p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-6 w-24 bg-first-100" />
      <Skeleton className="h-4 w-14 bg-first-100" />
    </div>

    <Skeleton className="mb-3 h-5 w-28 bg-first-100" />
    <FilterItemsSkeleton />

    <div className="mt-4 border-t border-first-100 pt-4">
      <Skeleton className="h-5 w-36 bg-first-100" />
    </div>
  </div>
);

export const GridProductsSkeleton = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`grid-skeleton-${index}`}
        className="h-95 rounded-xl border border-first-100/70 bg-color-for-layer-on-body p-4 shadow-[0_10px_26px_-20px_rgba(27,126,251,0.45)]"
      >
        <div className="relative mb-3 h-1/2">
          <div className="absolute inset-x-0 top-0 flex items-start justify-between">
            <Skeleton className="h-7 w-12 rounded-md bg-first-100" />
            <Skeleton className="h-7 w-20 rounded-md bg-first-100" />
          </div>
          <Skeleton className="h-full w-full rounded-xl bg-first-100" />
        </div>

        <div className="mb-10 space-y-2">
          <Skeleton className="h-5 w-4/5 bg-first-100" />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-first-100" />
            <Skeleton className="h-5 w-28 bg-first-100" />
          </div>
          <Skeleton className="h-5 w-14 bg-first-100" />
        </div>

        <Skeleton className="h-10 w-full rounded-lg bg-first-100" />
      </div>
    ))}
  </div>
);

export const ProductsContentSkeleton = ({ count }: { count: number }) => {
  return <GridProductsSkeleton count={count} />;
};
