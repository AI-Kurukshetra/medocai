'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentViewer } from './DocumentViewer'
import { CodeSuggestionPanel } from './CodeSuggestionPanel'
import { QueryComposer } from '@/components/queries/QueryComposer'
import { StatusPill } from '@/components/shared/StatusPill'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, Brain, FileText, MessageSquare, DollarSign, Loader2, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export function CaseDetail({ encounter }: { encounter: any }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Seed initial analysis from the most complete already-processed document
  const preloadedAnalysis = (() => {
    const docs: any[] = encounter.clinical_documents || []
    const processed = docs.find((d: any) =>
      d.ai_processed &&
      ((d.documentation_gaps as any[])?.length > 0 ||
        (d.extracted_diagnoses as any[])?.length > 0)
    )
    if (!processed) return null
    return {
      diagnoses: processed.extracted_diagnoses || [],
      procedures: processed.extracted_procedures || [],
      key_labs: processed.extracted_labs || [],
      documentation_gaps: processed.documentation_gaps || [],
      drg_opportunities: [],
    }
  })()

  const [analysisResult, setAnalysisResult] = useState<any>(preloadedAnalysis)
  const [showQueryComposer, setShowQueryComposer] = useState(false)
  const [selectedGap, setSelectedGap] = useState<any>(null)

  const handleAnalyzeDocument = async (documentId: string, content: string) => {
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, content }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnalysisError(data.error || 'Analysis failed. Please try again.')
      } else {
        setAnalysisResult(data.analysis)
      }
    } catch {
      setAnalysisError('Network error. Please check your connection and try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCreateQuery = (gap: any) => {
    setSelectedGap(gap)
    setShowQueryComposer(true)
  }

  const patient = encounter.patients
  const physician = encounter.user_profiles
  const documents = encounter.clinical_documents || []
  const diagnoses = encounter.encounter_diagnoses || []
  const queries = encounter.queries || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <StatusPill status={encounter.cdi_status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
            <span className="font-mono">{patient.mrn}</span>
            <span>•</span>
            <span>Admitted {format(new Date(encounter.admission_date), 'MMMM d, yyyy')}</span>
            {physician?.full_name && (
              <>
                <span>•</span>
                <span>{physician.full_name}</span>
              </>
            )}
            {encounter.department && (
              <>
                <span>•</span>
                <span>{encounter.department}</span>
              </>
            )}
          </div>
        </div>

        {encounter.revenue_impact > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              +${encounter.revenue_impact?.toLocaleString()} captured
            </span>
          </div>
        )}
      </div>

      {/* AI Analysis Error */}
      {analysisError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{analysisError}</p>
          <button
            className="ml-auto text-xs text-red-500 hover:text-red-700 underline"
            onClick={() => setAnalysisError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Documentation Gaps Alert */}
      {encounter.documentation_gaps_count > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {encounter.documentation_gaps_count} documentation gap{encounter.documentation_gaps_count > 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Review AI findings and create queries to improve DRG assignment and revenue capture.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="diagnoses" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Diagnoses & Codes
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Queries ({queries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {documents.map((doc: any) => (
                <DocumentViewer
                  key={doc.id}
                  document={doc}
                  onAnalyze={handleAnalyzeDocument}
                  analyzing={analyzing}
                />
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-12">No documents for this encounter.</p>
              )}
            </div>
            <div>
              <CodeSuggestionPanel
                analysisResult={analysisResult}
                existingDiagnoses={diagnoses}
                encounterId={encounter.id}
                onCreateQuery={handleCreateQuery}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diagnoses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documented Diagnoses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnoses.map((dx: any) => (
                  <div key={dx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="space-y-1">
                      <ICD10Badge
                        code={dx.icd10_code}
                        description={dx.icd10_description}
                        ccMcc={dx.cc_mcc_status}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 capitalize">{dx.diagnosis_type}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400 capitalize">
                          Added by {dx.source?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {dx.ai_confidence && (
                      <div className="text-right">
                        <span className="text-xs text-slate-400">AI Confidence</span>
                        <p className="text-sm font-medium text-slate-700">{Math.round(dx.ai_confidence * 100)}%</p>
                      </div>
                    )}
                  </div>
                ))}
                {diagnoses.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No diagnoses documented yet. Analyze documents to get AI suggestions.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries">
          <div className="space-y-4">
            {queries.map((query: any) => (
              <Card key={query.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusPill status={query.status} />
                        <span className="text-xs text-slate-400 capitalize">{query.query_type?.replace('_', ' ')}</span>
                        {query.ai_generated && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-slate-800">{query.subject}</p>
                      <p className="text-sm text-slate-600">{query.body}</p>
                      {query.physician_response && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs font-medium text-green-700 mb-1">Physician Response:</p>
                          <p className="text-sm text-green-800">{query.physician_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={() => setShowQueryComposer(true)}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Create New Query
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showQueryComposer && (
        <QueryComposer
          encounterId={encounter.id}
          gap={selectedGap}
          physicianId={encounter.attending_physician_id}
          physicianName={physician?.full_name}
          onClose={() => { setShowQueryComposer(false); setSelectedGap(null) }}
        />
      )}
    </div>
  )
}
