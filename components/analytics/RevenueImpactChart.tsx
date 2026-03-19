'use client'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

export function RevenueImpactChart({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const tickColor = isDark ? '#94A3B8' : '#64748B'
  const gridColor = isDark ? '#1E293B' : '#F1F5F9'
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0'
  const tooltipText = isDark ? '#F1F5F9' : '#0F172A'

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
        ;(encounters as any[])?.forEach((e: any) => {
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <Tooltip
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue Impact']}
                contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                labelStyle={{ color: tickColor }}
              />
              <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
