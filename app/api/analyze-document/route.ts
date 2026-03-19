import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { DOCUMENT_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { documentId, content } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      system: DOCUMENT_ANALYSIS_PROMPT,
      messages: [{ role: 'user', content: `Analyze this clinical document:\n\n${content}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const analysis = JSON.parse(responseText)

    await supabase
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

    const { data: doc } = await supabase
      .from('clinical_documents')
      .select('encounter_id')
      .eq('id', documentId)
      .single()

    if (doc?.encounter_id) {
      await supabase
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
