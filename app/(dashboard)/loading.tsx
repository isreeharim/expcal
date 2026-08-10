export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl animate-shimmer" />
        <div className="h-4 w-80 rounded-lg animate-shimmer" />
      </div>

      {/* Hero card skeleton */}
      <div className="rounded-2xl border border-border/40 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl animate-shimmer" />
          <div className="h-5 w-24 rounded-full animate-shimmer" />
        </div>
        <div className="h-4 w-32 rounded-lg animate-shimmer" />
        <div className="h-10 w-48 rounded-xl animate-shimmer" />
      </div>

      {/* Compact stat row skeleton */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border/40 p-4 space-y-3">
            <div className="w-7 h-7 rounded-lg animate-shimmer" />
            <div className="h-3 w-16 rounded animate-shimmer" />
            <div className="h-6 w-24 rounded-lg animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-36 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border/40 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl animate-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 rounded animate-shimmer" />
                  <div className="h-3 w-24 rounded animate-shimmer" />
                </div>
              </div>
              <div className="h-8 w-full rounded-lg animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
