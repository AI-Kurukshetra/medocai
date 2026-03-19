'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StatusPill } from '@/components/shared/StatusPill'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

export function CaseWorklist({ encounters }: { encounters: any[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = encounters.filter(e => {
    const patient = e.patients
    const matchesSearch = !search ||
      `${patient?.first_name} ${patient?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      patient?.mrn?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.cdi_status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by patient name or MRN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unreviewed">Unreviewed</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="queried">Queried</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admitted</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Principal Dx</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">DRG</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gaps</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">CDI Status</th>
              <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue Impact</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(encounter => (
              <tr key={encounter.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {encounter.patients?.first_name} {encounter.patients?.last_name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{encounter.patients?.mrn}</p>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {format(new Date(encounter.admission_date), 'MMM d, yyyy')}
                </td>
                <td className="p-4">
                  {encounter.principal_diagnosis_code ? (
                    <ICD10Badge code={encounter.principal_diagnosis_code} />
                  ) : (
                    <span className="text-xs text-slate-400">Not assigned</span>
                  )}
                </td>
                <td className="p-4">
                  {encounter.assigned_drg ? (
                    <div>
                      <span className="font-mono text-xs font-medium text-slate-700">DRG {encounter.assigned_drg}</span>
                      <p className="text-xs text-slate-400 truncate max-w-32">{encounter.drg_description}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  {encounter.documentation_gaps_count > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">{encounter.documentation_gaps_count}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </td>
                <td className="p-4">
                  <StatusPill status={encounter.cdi_status} />
                </td>
                <td className="p-4 text-right">
                  {encounter.revenue_impact > 0 ? (
                    <span className="text-sm font-semibold text-green-600">
                      +${encounter.revenue_impact.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  <Link href={`/cases/${encounter.id}`}>
                    <ChevronRight className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No cases match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
