export default function CaseDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="h-9 w-80 bg-slate-100 rounded-lg" />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-7 w-28 bg-slate-100 rounded-md" />
              </div>
              <div className="h-32 bg-slate-50 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-20 bg-slate-50 rounded-lg" />
          <div className="h-20 bg-slate-50 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
