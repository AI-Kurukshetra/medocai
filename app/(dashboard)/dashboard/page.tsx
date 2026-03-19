import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueImpactChart } from '@/components/analytics/RevenueImpactChart'
import { QueryResponseRateChart } from '@/components/analytics/QueryResponseRateChart'
import { DollarSign, FileSearch, MessageSquare, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()
  const orgId = (profile as any)?.organization_id

  const [
    { count: activeEncounters },
    { count: pendingQueries },
    { data: revenueData },
    { count: completedThisWeek },
  ] = await Promise.all([
    supabase.from('encounters').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['active', 'pending_query']),
    supabase.from('queries').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('encounters').select('revenue_impact').eq('organization_id', orgId).not('revenue_impact', 'is', null),
    supabase.from('encounters').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('cdi_status', 'complete').gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const totalRevenue = (revenueData as any[])?.reduce((sum: number, e: any) => sum + (e.revenue_impact || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">CDI Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Clinical documentation performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Cases"
          value={activeEncounters || 0}
          icon={FileSearch}
          trend="+12% this week"
          trendUp={true}
          color="blue"
        />
        <KPICard
          title="Pending Queries"
          value={pendingQueries || 0}
          icon={MessageSquare}
          trend="Avg 18hr response"
          color="amber"
        />
        <KPICard
          title="Revenue Impact"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trend="This month"
          trendUp={true}
          color="green"
        />
        <KPICard
          title="Completed This Week"
          value={completedThisWeek || 0}
          icon={TrendingUp}
          trend="Cases closed"
          trendUp={true}
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueImpactChart organizationId={orgId!} />
        <QueryResponseRateChart organizationId={orgId!} />
      </div>
    </div>
  )
}
