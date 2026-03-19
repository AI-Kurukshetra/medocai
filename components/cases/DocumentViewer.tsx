'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, ChevronDown, ChevronUp, Loader2, FileText } from 'lucide-react'
import { format } from 'date-fns'

const DOC_TYPE_LABELS: Record<string, string> = {
  hp: 'H&P',
  progress_note: 'Progress Note',
  discharge_summary: 'Discharge Summary',
  operative_note: 'Operative Note',
  consult_note: 'Consult Note',
  lab_report: 'Lab Report',
  radiology_report: 'Radiology Report',
  nursing_note: 'Nursing Note',
}

export function DocumentViewer({ document, onAnalyze, analyzing }: {
  document: any
  onAnalyze: (id: string, content: string) => void
  analyzing: boolean
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{document.title}</p>
              <p className="text-xs text-slate-400">
                {DOC_TYPE_LABELS[document.document_type] || document.document_type}
                {document.author_name && ` • ${document.author_name}`}
                {` • ${format(new Date(document.document_date), 'MMM d, yyyy h:mm a')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!document.ai_processed && (
              <Button
                size="sm"
                onClick={() => onAnalyze(document.id, document.content)}
                disabled={analyzing}
                className="text-xs"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            )}
            {document.ai_processed && (
              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-medium">
                ✓ AI Analyzed
              </span>
            )}
            <button onClick={() => setExpanded(!expanded)}>
              {expanded
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div
            className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed p-4 rounded-lg"
            style={{
              background: '#F8FAFC',
              fontSize: '0.8125rem',
              maxHeight: '400px',
              overflowY: 'auto',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {document.content}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
