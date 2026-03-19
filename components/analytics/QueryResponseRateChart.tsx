'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#0D9488', '#F59E0B', '#EF4444', '#64748B']

export function QueryResponseRateChart({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data: queries } = await supabase
          .from('queries')
          .select('status, encounter_id, encounters!inner(organization_id)')
          .eq('encounters.organization_id', organizationId)

        const counts: Record<string, number> = {}
        queries?.forEach(q => {
          const label = q.status === 'answered' || q.status === 'agreed' ? 'Answered'
            : q.status === 'sent' || q.status === 'viewed' ? 'Pending'
            : q.status === 'disagreed' ? 'Disagreed'
            : 'Other'
          counts[label] = (counts[label] || 0) + 1
        })
        setData(Object.entries(counts).map(([name, value]) => ({ name, value })))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Query Response Rate</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading chart...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
            No query data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
