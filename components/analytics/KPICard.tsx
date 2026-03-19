import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue: { bg: '#EFF6FF', icon: '#2563EB' },
  amber: { bg: '#FFFBEB', icon: '#D97706' },
  green: { bg: '#F0FDF4', icon: '#16A34A' },
  teal: { bg: '#F0FDFA', icon: '#0D9488' },
}

export function KPICard({ title, value, icon: Icon, trend, trendUp, color = 'teal' }: {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: keyof typeof colorMap
}) {
  const colors = colorMap[color]
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trendUp !== undefined && (
                  trendUp
                    ? <TrendingUp className="w-3 h-3 text-green-500" />
                    : <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className="text-xs text-slate-400">{trend}</span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.bg }}>
            <Icon className="w-5 h-5" style={{ color: colors.icon }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
