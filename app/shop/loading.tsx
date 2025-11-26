export default function ShopLoading() {
  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="regime-container">
        {/* Header Skeleton */}
        <div className="text-center mb-12 space-y-4">
          <div className="h-12 w-64 bg-muted animate-pulse rounded-lg mx-auto" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg mx-auto" />
        </div>

        {/* Filters Skeleton */}
        <div className="regime-card mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="h-6 bg-muted animate-pulse rounded-lg w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
