export function ICD10Badge({ code, description, ccMcc }: {
  code: string
  description?: string
  ccMcc?: 'cc' | 'mcc' | 'none' | null
}) {
  const ccMccColors = {
    mcc: { bg: '#FEE2E2', color: '#991B1B', label: 'MCC' },
    cc: { bg: '#FEF3C7', color: '#92400E', label: 'CC' },
    none: null,
  }
  const badge = ccMcc && ccMcc !== 'none' ? ccMccColors[ccMcc] : null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <code
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ background: '#F0FDFA', color: '#0F766E', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {code}
      </code>
      {description && <span className="text-sm text-slate-600">{description}</span>}
      {badge && (
        <span
          className="px-1.5 py-0.5 rounded text-xs font-bold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
      )}
    </div>
  )
}
