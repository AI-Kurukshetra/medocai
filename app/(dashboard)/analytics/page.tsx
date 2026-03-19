import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/analytics/KPICard'
import { RevenueImpactChart } from '@/components/analytics/RevenueImpactChart'
import { QueryResponseRateChart } from '@/components/analytics/QueryResponseRateChart'
import { DollarSign, FileSearch, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()
  const orgId = (profile as any)?.organization_id

  const [
    { count: totalEncounters },
    { count: totalQueries },
    { data: revenueData },
    { count: agreedQueries },
  ] = await Promise.all([
    supabase.from('encounters').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
    supabase.from('queries').select('*', { count: 'exact', head: true }),
    supabase.from('encounters').select('revenue_impact').eq('organization_id', orgId).not('revenue_impact', 'is', null),
    supabase.from('queries').select('*', { count: 'exact', head: true }).eq('status', 'agreed'),
  ])

  const totalRevenue = (revenueData as any[])?.reduce((sum: number, e: any) => sum + (e.revenue_impact || 0), 0) || 0
  const queryRate = totalQueries ? Math.round(((agreedQueries || 0) / totalQueries) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Revenue and quality performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Encounters"
          value={totalEncounters || 0}
          icon={FileSearch}
          color="blue"
        />
        <KPICard
          title="Total Queries"
          value={totalQueries || 0}
          icon={MessageSquare}
          color="amber"
        />
        <KPICard
          title="Total Revenue Captured"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trendUp={true}
          color="green"
        />
        <KPICard
          title="Query Agreement Rate"
          value={`${queryRate}%`}
          icon={CheckCircle}
          trendUp={queryRate > 70}
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
