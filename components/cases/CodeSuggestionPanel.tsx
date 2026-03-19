'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, Plus, MessageSquare, TrendingUp, Sparkles } from 'lucide-react'

export function CodeSuggestionPanel({ analysisResult, existingDiagnoses, encounterId, onCreateQuery }: {
  analysisResult: any
  existingDiagnoses: any[]
  encounterId: string
  onCreateQuery: (gap: any) => void
}) {
  if (!analysisResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-6">
            Click &quot;Analyze with AI&quot; on a document to see code suggestions and documentation gaps.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {analysisResult.diagnoses?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Suggested Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.diagnoses.map((dx: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                <ICD10Badge code={dx.suggested_icd10} description={dx.description} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${dx.confidence * 100}%`, background: 'var(--primary)' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{Math.round(dx.confidence * 100)}%</span>
                  </div>
                  {dx.requires_clarification ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => onCreateQuery({ description: dx.clarification_reason, code: dx.suggested_icd10 })}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Query
                    </Button>
                  ) : (
                    <Button size="sm" className="text-xs h-7" style={{ background: 'var(--primary)', color: 'white' }}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysisResult.documentation_gaps?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Documentation Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.documentation_gaps.map((gap: any, i: number) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-2">
                <p className="text-xs font-medium text-amber-800 capitalize">{gap.gap_type?.replace('_', ' ')}</p>
                <p className="text-xs text-amber-700">{gap.description}</p>
                <p className="text-xs text-amber-600 italic">{gap.impact}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 w-full border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => onCreateQuery(gap)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Generate Query
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysisResult.drg_opportunities?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Revenue Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisResult.drg_opportunities.map((opp: any, i: number) => (
              <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-green-800">
                    DRG {opp.current_drg} → {opp.suggested_drg}
                  </span>
                  <span className="text-sm font-bold text-green-700">+${opp.revenue_impact?.toLocaleString()}</span>
                </div>
                <p className="text-xs text-green-700">{opp.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
