'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/shared/StatusPill'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronRight, Brain, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function QueryList({ queries, userRole }: { queries: any[]; userRole?: string }) {
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const router = useRouter()

  const handleRespond = async (queryId: string, agree: boolean, agreedCode?: string) => {
    setSubmittingId(queryId)
    try {
      const supabase = createClient()
      await supabase.from('queries').update({
        status: agree ? 'agreed' : 'disagreed',
        physician_response: responseText,
        agreed_code: agreedCode || null,
        response_date: new Date().toISOString(),
      }).eq('id', queryId)
      setRespondingId(null)
      setResponseText('')
      router.refresh()
    } finally {
      setSubmittingId(null)
    }
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No queries found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {queries.map(query => {
        const patient = query.encounters?.patients
        const isPhysician = userRole === 'physician'
        const canRespond = isPhysician && (query.status === 'sent' || query.status === 'viewed')

        return (
          <Card key={query.id}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusPill status={query.status} />
                      <span className="text-xs text-slate-400 capitalize">
                        {query.query_type?.replace(/_/g, ' ')}
                      </span>
                      {query.ai_generated && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium flex items-center gap-1">
                          <Brain className="w-3 h-3" /> AI Generated
                        </span>
                      )}
                      <span className="text-xs text-slate-400 capitalize">{query.priority} priority</span>
                    </div>
                    <p className="font-medium text-slate-800">{query.subject}</p>
                    {patient && (
                      <p className="text-xs text-slate-400">
                        Patient: {patient.first_name} {patient.last_name} •{' '}
                        <span className="font-mono">{patient.mrn}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                    {format(new Date(query.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                <p className="text-sm text-slate-600">{query.body}</p>

                {query.suggested_options?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-500">Options presented:</p>
                    {query.suggested_options.map((opt: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="font-mono text-teal-600 shrink-0">{opt.code}</span>
                        <span>{opt.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {query.physician_response && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-medium text-green-700 mb-1">Physician Response:</p>
                    <p className="text-sm text-green-800">{query.physician_response}</p>
                  </div>
                )}

                {canRespond && respondingId !== query.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRespondingId(query.id)}
                    className="text-xs"
                  >
                    Respond to Query
                  </Button>
                )}

                {respondingId === query.id && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Textarea
                      placeholder="Your response..."
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                      disabled={submittingId === query.id}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(query.id, true)}
                        style={{ background: 'var(--primary)', color: 'white' }}
                        disabled={!responseText || submittingId === query.id}
                      >
                        {submittingId === query.id
                          ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
                          : 'Agree'
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(query.id, false)}
                        disabled={!responseText || submittingId === query.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {submittingId === query.id
                          ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</>
                          : 'Disagree'
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRespondingId(null)}
                        disabled={submittingId === query.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {query.encounters?.id && (
                  <div className="flex justify-end">
                    <Link
                      href={`/cases/${query.encounters.id}`}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      View Case <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
