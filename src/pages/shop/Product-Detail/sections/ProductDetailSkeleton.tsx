import { Skeleton } from '@/components/ui/skeleton';

const skeletonBlock = 'bg-first/10';
const skeletonPanel = 'rounded-2xl border border-first/10 bg-first/5';

const ProductDetailSkeleton = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 space-y-3 lg:col-span-3">
          <Skeleton className={`${skeletonBlock} aspect-square w-full rounded-2xl`} />
          <div className="flex gap-2 overflow-hidden pb-1">
            {[...Array(4)].map((_, index) => (
              <Skeleton
                key={index}
                className={`${skeletonBlock} h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20`}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-5 lg:col-span-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-secound/20" />
            <Skeleton className={`${skeletonBlock} h-8 w-4/5`} />
            <div className="space-y-2">
              <Skeleton className={`${skeletonBlock} h-4 w-full`} />
              <Skeleton className={`${skeletonBlock} h-4 w-11/12`} />
              <Skeleton className={`${skeletonBlock} h-4 w-3/4`} />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className={`${skeletonBlock} h-6 w-36`} />
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className={`${skeletonPanel} space-y-2 rounded-sm p-2`}>
                  <Skeleton className={`${skeletonBlock} h-3 w-2/3`} />
                  <Skeleton className={`${skeletonBlock} h-4 w-full`} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className={`${skeletonBlock} h-6 w-44`} />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className={`${skeletonBlock} h-11 rounded-md`} />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-24">
            <div className="space-y-5 rounded-xl bg-first/5 p-6">
              <div className="space-y-4 rounded-lg bg-color-for-layer-on-body p-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <Skeleton className={`${skeletonBlock} h-4 w-28`} />
                    <Skeleton className={`${skeletonBlock} h-4 w-20`} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className={`${skeletonBlock} h-12 rounded-md`} />
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <Skeleton className={`${skeletonBlock} h-5 w-24`} />
                  <Skeleton className={`${skeletonBlock} h-8 w-36`} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className={`${skeletonBlock} h-14 rounded-xl`} />
                  ))}
                </div>
              </div>

              <Skeleton className="h-12 w-full rounded-lg bg-secound/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className={`${skeletonPanel} p-4`}>
            <Skeleton className={`${skeletonBlock} mb-3 h-8 w-8 rounded-full`} />
            <Skeleton className={`${skeletonBlock} mb-2 h-4 w-2/3`} />
            <Skeleton className={`${skeletonBlock} h-3 w-full`} />
          </div>
        ))}
      </div>

      <section className="space-y-5">
        <div className="space-y-2">
          <Skeleton className={`${skeletonBlock} h-7 w-40`} />
          <Skeleton className={`${skeletonBlock} h-4 w-full`} />
          <Skeleton className={`${skeletonBlock} h-4 w-11/12`} />
          <Skeleton className={`${skeletonBlock} h-4 w-2/3`} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-first/10">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] ${
                index % 2 === 0 ? 'bg-color-for-layer-on-body' : 'bg-first/5'
              }`}
            >
              <Skeleton className={`${skeletonBlock} h-4 w-28`} />
              <Skeleton className={`${skeletonBlock} h-4 w-full`} />
            </div>
          ))}
        </div>
      </section>

      <section className={`${skeletonPanel} space-y-5 p-4 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className={`${skeletonBlock} h-7 w-36`} />
          <Skeleton className={`${skeletonBlock} h-10 w-32 rounded-xl`} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
          <div className="space-y-2">
            <Skeleton className={`${skeletonBlock} h-10 w-28`} />
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className={`${skeletonBlock} h-3 w-full`} />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="rounded-2xl border border-first/10 p-4">
                <Skeleton className={`${skeletonBlock} mb-3 h-5 w-1/2`} />
                <Skeleton className={`${skeletonBlock} mb-2 h-4 w-full`} />
                <Skeleton className={`${skeletonBlock} h-4 w-4/5`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <Skeleton className={`${skeletonBlock} h-7 w-52`} />
          <div className="flex gap-2">
            <Skeleton className={`${skeletonBlock} h-10 w-10 rounded-xl`} />
            <Skeleton className={`${skeletonBlock} h-10 w-10 rounded-xl`} />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <Skeleton
              key={index}
              className={`${skeletonBlock} h-80 w-[min(78vw,18rem)] shrink-0 rounded-2xl`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailSkeleton;
