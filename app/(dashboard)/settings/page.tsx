import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profileRaw } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', user!.id)
    .single()
  const profile = profileRaw as any

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Account and organization settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{profile?.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Role</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
            </div>
            {profile?.specialty && (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Specialty</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{profile.specialty}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{profile?.organizations?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Type</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{profile?.organizations?.type}</p>
            </div>
            {profile?.organizations?.beds_count && (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Beds</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{profile.organizations.beds_count}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
