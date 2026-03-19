import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const { data: patientsRaw } = await supabase
    .from('patients')
    .select('*, encounters(count)')
    .eq('organization_id', (profile as any)?.organization_id)
    .order('created_at', { ascending: false })
    .limit(100)
  const patients = patientsRaw as any[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Patients</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Patient registry for your organization</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Patient</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">MRN</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">DOB</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gender</th>
              <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Insurance</th>
            </tr>
          </thead>
          <tbody>
            {patients?.map(patient => (
              <tr key={patient.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {patient.first_name} {patient.last_name}
                  </p>
                </td>
                <td className="p-4">
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{patient.mrn}</span>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {format(new Date(patient.date_of_birth), 'MMM d, yyyy')}
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{patient.gender || '—'}</td>
                <td className="p-4">
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {patient.insurance_type?.replace('_', ' ') || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!patients || patients.length === 0) && (
          <div className="p-12 text-center text-slate-400">No patients found.</div>
        )}
      </div>
    </div>
  )
}
