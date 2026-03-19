'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ICD10Badge } from '@/components/shared/ICD10Badge'
import { AlertTriangle, Plus, MessageSquare, TrendingUp, Sparkles, Check, Loader2 } from 'lucide-react'

export function CodeSuggestionPanel({ analysisResult, existingDiagnoses, encounterId, onCreateQuery }: {
  analysisResult: any
  existingDiagnoses: any[]
  encounterId: string
  onCreateQuery: (gap: any) => void
}) {
  const router = useRouter()
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(
    new Set(existingDiagnoses.map((d: any) => d.icd10_code))
  )

  const handleAddCode = async (dx: any) => {
    const code = dx.suggested_icd10
    if (added.has(code) || adding) return
    setAdding(code)
    try {
      const supabase = createClient()
      const { error } = await (supabase as any).from('encounter_diagnoses').insert({
        encounter_id: encounterId,
        icd10_code: code,
        icd10_description: dx.description,
        diagnosis_type: 'secondary',
        source: 'ai_suggested',
        ai_confidence: dx.confidence,
      })
      if (!error) {
        setAdded(prev => new Set(prev).add(code))
        router.refresh()
      }
    } finally {
      setAdding(null)
    }
  }

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

  const gapCount = analysisResult.documentation_gaps?.length ?? 0
  const codeCount = analysisResult.diagnoses?.length ?? 0
  const revenueCount = analysisResult.drg_opportunities?.length ?? 0

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-500" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <Tabs defaultValue="gaps">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="gaps" className="flex-1 text-xs">
              Gaps
              {gapCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs leading-none">
                  {gapCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex-1 text-xs">
              Codes
              {codeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs leading-none">
                  {codeCount}
                </span>
              )}
            </TabsTrigger>
            {revenueCount > 0 && (
              <TabsTrigger value="revenue" className="flex-1 text-xs">
                Revenue
                <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs leading-none">
                  {revenueCount}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="gaps" className="space-y-3 mt-0">
            {gapCount === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No documentation gaps found.</p>
            ) : (
              analysisResult.documentation_gaps.map((gap: any, i: number) => (
                <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 capitalize">{gap.gap_type?.replace('_', ' ')}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">{gap.description}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 italic">{gap.impact}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 w-full border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    onClick={() => onCreateQuery(gap)}
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Generate Query
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="codes" className="space-y-2 mt-0">
            {codeCount === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No suggested codes.</p>
            ) : (
              analysisResult.diagnoses.map((dx: any, i: number) => {
                const code = dx.suggested_icd10
                const isAdded = added.has(code)
                const isAdding = adding === code

                return (
                  <div key={i} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <ICD10Badge code={code} description={dx.description} />
                      {dx.requires_clarification ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 w-16 shrink-0"
                          onClick={() => onCreateQuery({ description: dx.clarification_reason, code })}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Query
                        </Button>
                      ) : isAdded ? (
                        <Button size="sm" className="text-xs h-7 w-16 shrink-0 cursor-default" style={{ background: '#10B981', color: 'white' }} disabled>
                          <Check className="w-3 h-3 mr-1" />
                          Added
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="text-xs h-7 w-16 shrink-0"
                          style={{ background: 'var(--primary)', color: 'white' }}
                          disabled={isAdding}
                          onClick={() => handleAddCode(dx)}
                        >
                          {isAdding
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><Plus className="w-3 h-3 mr-1" />Add</>
                          }
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${dx.confidence * 100}%`, background: 'var(--primary)' }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-300">{Math.round(dx.confidence * 100)}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>

          {revenueCount > 0 && (
            <TabsContent value="revenue" className="space-y-3 mt-0">
              {analysisResult.drg_opportunities.map((opp: any, i: number) => (
                <div key={i} className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-green-800">
                      DRG {opp.current_drg} → {opp.suggested_drg}
                    </span>
                    <span className="text-sm font-bold text-green-700">+${opp.revenue_impact?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-700">{opp.rationale}</p>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
