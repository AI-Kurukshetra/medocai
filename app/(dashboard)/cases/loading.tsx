export default function CasesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-36 bg-slate-200 rounded" />
        <div className="h-4 w-56 bg-slate-100 rounded mt-2" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 flex-1 bg-slate-200 rounded-md" />
        <div className="h-9 w-44 bg-slate-200 rounded-md" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 p-4 flex gap-6">
          {['Patient', 'Admitted', 'Principal Dx', 'DRG', 'Gaps', 'Status', 'Revenue'].map(h => (
            <div key={h} className="h-3 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-slate-50 p-4 flex items-center gap-6">
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-3 w-8 bg-slate-100 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
            <div className="h-3 w-16 bg-slate-100 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
