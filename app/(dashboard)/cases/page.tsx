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

  const { data: encounters } = await supabase
    .from('encounters')
    .select(`
      *,
      patients (first_name, last_name, mrn, insurance_type),
      user_profiles!attending_physician_id (full_name)
    `)
    .eq('organization_id', profile?.organization_id)
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Case Worklist</h1>
        <p className="text-slate-500 mt-1">Active encounters requiring CDI review</p>
      </div>
      <CaseWorklist encounters={encounters || []} />
    </div>
  )
}
