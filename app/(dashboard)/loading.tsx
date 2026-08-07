export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted/40 rounded-xl" />
          <div className="h-4 w-72 bg-muted/20 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-muted/40 rounded-xl" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/30 p-4 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-muted/40" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted/30 rounded" />
              <div className="h-6 w-28 bg-muted/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 rounded-2xl bg-muted/20 border border-border/40 p-6" />
    </div>
  )
}
