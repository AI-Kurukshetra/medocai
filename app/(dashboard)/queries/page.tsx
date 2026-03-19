import { createClient } from '@/lib/supabase/server'
import { QueryList } from '@/components/queries/QueryList'

export default async function QueriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user!.id).single()

  let query = supabase
    .from('queries')
    .select(`
      *,
      encounters (
        id,
        patients (first_name, last_name, mrn)
      )
    `)
    .order('created_at', { ascending: false })

  if (profile?.role === 'physician') {
    query = query.eq('assigned_to', user!.id)
  } else {
    // CDI specialists and others see queries they created
    query = query.eq('created_by', user!.id)
  }

  const { data: queries } = await query.limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Queries</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {profile?.role === 'physician' ? 'Queries awaiting your response' : 'All physician queries'}
        </p>
      </div>
      <QueryList queries={queries || []} userRole={profile?.role} />
    </div>
  )
}
