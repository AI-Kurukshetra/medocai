export default function QueriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-48 bg-slate-100 rounded mt-2" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-1/3 bg-slate-100 rounded" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-5/6 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
