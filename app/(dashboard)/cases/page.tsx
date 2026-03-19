import { createClient } from '@/lib/supabase/server'
import { CaseWorklist } from '@/components/cases/CaseWorklist'

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id, role')
    .eq('id', user!.id)
    .single()

  let encountersQuery = supabase
    .from('encounters')
    .select(`
      *,
      patients (first_name, last_name, mrn, insurance_type),
      user_profiles!attending_physician_id (full_name)
    `)
    .order('updated_at', { ascending: false })
    .limit(50)

  const p = profile as any
  if (p?.role === 'physician') {
    encountersQuery = encountersQuery.eq('attending_physician_id', user!.id)
  } else {
    encountersQuery = encountersQuery.eq('organization_id', p?.organization_id)
  }

  const { data: encounters } = await encountersQuery

  const isPhysician = p?.role === 'physician'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {isPhysician ? 'My Cases' : 'Case Worklist'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isPhysician ? 'Your active patient encounters' : 'Active encounters requiring CDI review'}
        </p>
      </div>
      <CaseWorklist encounters={encounters || []} userRole={p?.role} />
    </div>
  )
}
