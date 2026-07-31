import { Skeleton } from '@/components/ui/skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="space-y-10">
      <div className="mb-16 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-3 lg:col-span-3">
          <Skeleton className="aspect-square w-full rounded-xl border border-first-100/70 bg-first-100" />
          <div className="flex gap-2 overflow-hidden pb-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`gallery-thumb-${index}`}
                className="h-16 w-16 shrink-0 rounded-md bg-first-100"
              />
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-first-100" />
            <Skeleton className="h-8 w-4/5 bg-first-100" />
            <Skeleton className="h-4 w-full bg-first-100" />
            <Skeleton className="h-4 w-5/6 bg-first-100" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-first-100" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`attribute-${index}`}
                  className="rounded-sm bg-color-for-layer-sec px-2 py-2"
                >
                  <Skeleton className="mb-2 h-4 w-3/4 bg-first-100" />
                  <Skeleton className="h-5 w-full bg-first-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-first-100" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`share-${index}`} className="h-10 rounded-md bg-first-100" />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 rounded-xl bg-color-for-layer-sec p-6">
            <div className="space-y-6 rounded-lg bg-color-for-layer-on-body p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`buy-meta-${index}`} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-28 bg-first-100" />
                  <Skeleton className="h-5 w-20 bg-first-100" />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-4">
              <Skeleton className="h-8 w-2/3 bg-first-100" />
              <Skeleton className="h-12 w-full rounded-lg bg-first-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`value-${index}`} className="rounded-lg bg-color-for-layer-sec p-4">
            <Skeleton className="mb-3 h-8 w-8 rounded-full bg-first-100" />
            <Skeleton className="mb-2 h-4 w-3/4 bg-first-100" />
            <Skeleton className="h-3 w-full bg-first-100" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-6">
        <div className="w-full space-y-4 lg:w-68/96">
          <Skeleton className="h-7 w-40 bg-first-100" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-first-100" />
            <Skeleton className="h-4 w-full bg-first-100" />
            <Skeleton className="h-4 w-5/6 bg-first-100" />
          </div>
          <Skeleton className="h-7 w-44 bg-first-100" />
          <div className="overflow-hidden rounded-2xl border border-gray-200/70">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`spec-${index}`}
                className="flex items-center justify-between gap-4 px-4 py-3 odd:bg-color-for-layer-on-body even:bg-color-for-layer-sec"
              >
                <Skeleton className="h-4 w-28 bg-first-100" />
                <Skeleton className="h-4 w-40 bg-first-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden w-full rounded-xl border border-gray-300 p-4 lg:block lg:w-26/96">
          <Skeleton className="mb-4 h-6 w-3/4 bg-first-100" />
          <Skeleton className="mb-3 h-8 w-2/3 bg-first-100" />
          <Skeleton className="h-11 w-full rounded-lg bg-first-100" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-44 bg-first-100" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`review-${index}`} className="space-y-2 border-b border-first-100 pb-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 bg-first-100" />
              <Skeleton className="h-4 w-24 bg-first-100" />
            </div>
            <Skeleton className="h-4 w-full bg-first-100" />
            <Skeleton className="h-4 w-3/4 bg-first-100" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-first-100" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`related-${index}`}
              className="w-80 shrink-0 overflow-hidden rounded-lg border border-first-100/70 bg-color-for-layer-on-body"
            >
              <Skeleton className="aspect-square w-full rounded-none bg-first-100" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-full bg-first-100" />
                <Skeleton className="h-4 w-3/4 bg-first-100" />
                <Skeleton className="h-6 w-24 bg-first-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
