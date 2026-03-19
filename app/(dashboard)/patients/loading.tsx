export default function PatientsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-28 bg-slate-200 rounded" />
        <div className="h-4 w-52 bg-slate-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 p-4 flex gap-12">
          {['Patient', 'MRN', 'DOB', 'Gender', 'Insurance'].map(h => (
            <div key={h} className="h-3 w-16 bg-slate-200 rounded" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b border-slate-50 p-4 flex items-center gap-12">
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-3 w-12 bg-slate-100 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
