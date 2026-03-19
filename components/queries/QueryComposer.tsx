'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function QueryComposer({ encounterId, gap, physicianId, physicianName, onClose }: {
  encounterId: string
  gap?: any
  physicianId?: string
  physicianName?: string
  onClose: () => void
}) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [queryData, setQueryData] = useState<any>(null)
  const [queryType, setQueryType] = useState('diagnosis_clarification')
  const [customBody, setCustomBody] = useState('')

  const handleGenerateQuery = async () => {
    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/generate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId,
          gap: gap?.description || 'Documentation needs clarification',
          clinicalEvidence: gap?.impact || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenerateError(data.error || 'Failed to generate query. You can still write one manually.')
      } else {
        setQueryData(data.query)
        setCustomBody(data.query.body)
      }
    } catch {
      setGenerateError('Network error. You can still write the query manually.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSendQuery = async () => {
    if (!physicianId) return
    setSending(true)
    setSendError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('queries').insert({
        encounter_id: encounterId,
        created_by: user!.id,
        assigned_to: physicianId,
        query_type: queryType,
        subject: queryData?.subject || 'Documentation Clarification Needed',
        body: customBody,
        suggested_options: queryData?.options || [],
        status: 'sent',
        sent_at: new Date().toISOString(),
        ai_generated: !!queryData,
        priority: 'normal',
      })

      if (error) {
        setSendError('Failed to send query. Please try again.')
      } else {
        onClose()
        router.refresh()
      }
    } catch {
      setSendError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Physician Query</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-700">
              {physicianName?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{physicianName || 'Attending Physician'}</p>
              <p className="text-xs text-slate-400">Query recipient</p>
            </div>
          </div>

          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger>
              <SelectValue placeholder="Query type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagnosis_clarification">Diagnosis Clarification</SelectItem>
              <SelectItem value="specificity">Specificity Required</SelectItem>
              <SelectItem value="clinical_validation">Clinical Validation</SelectItem>
              <SelectItem value="cc_mcc_capture">CC/MCC Capture</SelectItem>
              <SelectItem value="procedure_clarification">Procedure Clarification</SelectItem>
            </SelectContent>
          </Select>

          {gap && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-medium text-amber-700 mb-1">Documentation Gap:</p>
              <p className="text-sm text-amber-800">{gap.description}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGenerateQuery}
            disabled={generating}
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {generating ? 'Generating with AI...' : 'Generate Query with AI'}
          </Button>

          {generateError && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {generateError}
            </p>
          )}

          {sendError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {sendError}
            </p>
          )}

          {queryData && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-xs font-medium text-teal-700 mb-1">Subject: {queryData.subject}</p>
              <p className="text-xs text-teal-600">Options: {queryData.options?.length} presented to physician</p>
            </div>
          )}

          <Textarea
            placeholder="Query message to physician..."
            value={customBody}
            onChange={e => setCustomBody(e.target.value)}
            rows={6}
            className="resize-none"
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSendQuery}
              disabled={sending || !customBody || !physicianId}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Query
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
