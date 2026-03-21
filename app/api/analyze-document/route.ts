import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/provider'
import { DOCUMENT_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { documentId, content } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const responseText = await callAI({
      system: DOCUMENT_ANALYSIS_PROMPT,
      user: `Analyze this clinical document:\n\n${content}`,
      maxTokens: 2000,
    })
    const analysis = JSON.parse(responseText)

    await (supabase as any)
      .from('clinical_documents')
      .update({
        ai_processed: true,
        ai_processed_at: new Date().toISOString(),
        extracted_diagnoses: analysis.diagnoses,
        extracted_procedures: analysis.procedures,
        extracted_labs: analysis.key_labs,
        documentation_gaps: analysis.documentation_gaps,
      })
      .eq('id', documentId)

    const { data: doc } = await (supabase as any)
      .from('clinical_documents')
      .select('encounter_id')
      .eq('id', documentId)
      .single()

    if (doc?.encounter_id) {
      await (supabase as any)
        .from('encounters')
        .update({
          documentation_gaps_count: analysis.documentation_gaps?.length || 0,
          ai_analysis_completed: true
        })
        .eq('id', doc.encounter_id)
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
