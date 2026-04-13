import { Skeleton } from "@/components/ui/Skeletons"

const ProductDetailSkeleton = () => {
  return (
       <div className="space-y-8">
            {/* Main Product Layout - 3 Column Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Product Gallery Skeleton - Column 1 (4 cols on desktop) */}
              <div className="lg:col-span-4 space-y-3">
                {/* Main Image Skeleton */}
                <Skeleton className="aspect-square w-full rounded-lg" />
                {/* Thumbnail Gallery Skeleton */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-16 w-16 flex-shrink-0 rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton - Column 2 (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Title Skeleton */}
                <Skeleton className="h-8 w-3/4" />

                {/* Rating & Review Skeleton */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>

                {/* Attributes Skeleton */}
                <div className="pt-2 pb-3 border-t dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-28 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Brand, SKU, Tags Skeleton */}
                <div className="pt-3 border-t dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                    <div className="flex gap-2">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="pt-3 border-t dark:border-gray-700 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Product Buy Box Skeleton - Column 3 (3 cols on desktop, hidden on mobile) */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="lg:sticky lg:top-4 lg:self-start">
                  <div className="border rounded-lg shadow-sm bg-background p-4 space-y-4">
                    {/* Price Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-8 w-1/2" />
                    </div>

                    {/* Variants Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex flex-wrap gap-1.5">
                        {[...Array(2)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-20 rounded-lg" />
                        ))}
                      </div>
                    </div>

                    {/* Quantity Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                      </div>
                    </div>

                    {/* Add to Cart Button Skeleton */}
                    <Skeleton className="h-12 w-full rounded-lg" />

                    {/* Warranty & Shipping Skeleton */}
                    <div className="pt-3 border-t dark:border-gray-700 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>

                    {/* Stock Status Skeleton */}
                    <div className="pt-2 border-t dark:border-gray-700">
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Tabs Skeleton */}
            <div className="space-y-4">
              {/* Tab Headers Skeleton */}
              <div className="border-b dark:border-gray-700">
                <div className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-32" />
                  ))}
                </div>
              </div>
              {/* Tab Content Skeleton */}
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            {/* Related Products Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="border dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>  )
}

export default ProductDetailSkeleton