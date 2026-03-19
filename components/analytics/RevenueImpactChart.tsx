'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

export function RevenueImpactChart({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: encounters } = await supabase
          .from('encounters')
          .select('admission_date, revenue_impact')
          .eq('organization_id', organizationId)
          .not('revenue_impact', 'is', null)
          .gte('admission_date', subDays(new Date(), 30).toISOString())

        const grouped: Record<string, number> = {}
        encounters?.forEach(e => {
          const week = format(new Date(e.admission_date), 'MMM d')
          grouped[week] = (grouped[week] || 0) + (e.revenue_impact || 0)
        })
        setData(Object.entries(grouped).map(([week, revenue]) => ({ week, revenue })))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Impact (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex flex-col gap-2 justify-end pb-6">
            {[60, 80, 45, 90, 55, 70, 40].map((h, i) => (
              <div key={i} className="flex items-end gap-2 h-full" style={{ display: 'inline-block', width: `${100 / 7}%`, verticalAlign: 'bottom' }}>
              </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Loading chart...</span>
              </div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
            No revenue data for the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue Impact']} />
              <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
