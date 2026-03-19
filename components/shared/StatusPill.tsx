const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  unreviewed: { label: 'Unreviewed', color: '#64748B', bg: '#F1F5F9' },
  in_review: { label: 'In Review', color: '#D97706', bg: '#FEF3C7' },
  queried: { label: 'Queried', color: '#2563EB', bg: '#DBEAFE' },
  complete: { label: 'Complete', color: '#059669', bg: '#D1FAE5' },
  sent: { label: 'Sent', color: '#2563EB', bg: '#DBEAFE' },
  answered: { label: 'Answered', color: '#059669', bg: '#D1FAE5' },
  agreed: { label: 'Agreed', color: '#059669', bg: '#D1FAE5' },
  disagreed: { label: 'Disagreed', color: '#DC2626', bg: '#FEE2E2' },
  pending_query: { label: 'Pending Query', color: '#D97706', bg: '#FEF3C7' },
  active: { label: 'Active', color: '#2563EB', bg: '#DBEAFE' },
  coded: { label: 'Coded', color: '#059669', bg: '#D1FAE5' },
  draft: { label: 'Draft', color: '#64748B', bg: '#F1F5F9' },
  withdrawn: { label: 'Withdrawn', color: '#64748B', bg: '#F1F5F9' },
  expired: { label: 'Expired', color: '#DC2626', bg: '#FEE2E2' },
}

export function StatusPill({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}
