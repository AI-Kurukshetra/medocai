'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, FileText } from 'lucide-react'

const DOC_TYPES = [
  { value: 'hp', label: 'H&P (History & Physical)' },
  { value: 'progress_note', label: 'Progress Note' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'consult_note', label: 'Consult Note' },
  { value: 'operative_note', label: 'Operative Note' },
  { value: 'nursing_note', label: 'Nursing Note' },
]

export function NewDocumentDialog({ encounterId, authorName, onClose }: {
  encounterId: string
  authorName?: string
  onClose: () => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docType, setDocType] = useState('progress_note')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await (supabase as any).from('clinical_documents').insert({
        encounter_id: encounterId,
        document_type: docType,
        title: title.trim(),
        content: content.trim(),
        author_name: authorName,
        document_date: new Date().toISOString(),
        ai_processed: false,
      })
      if (error) {
        setError('Failed to save document. Please try again.')
      } else {
        onClose()
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            New Clinical Document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Admission H&P"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Document Content</Label>
            <Textarea
              placeholder="Enter clinical documentation here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              className="resize-none font-mono text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
