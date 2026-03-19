import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseDetail } from '@/components/cases/CaseDetail'

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: encounter } = await supabase
    .from('encounters')
    .select(`
      *,
      patients (*),
      user_profiles!attending_physician_id (full_name, specialty),
      clinical_documents (*),
      encounter_diagnoses (*),
      queries (*)
    `)
    .eq('id', id)
    .single()

  if (!encounter) notFound()

  return <CaseDetail encounter={encounter} userRole={profile?.role} />
}
