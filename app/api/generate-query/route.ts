import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/provider'
import { QUERY_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { encounterId, gap, clinicalEvidence } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const responseText = await callAI({
      system: QUERY_GENERATION_PROMPT,
      user: `Generate a physician query for this gap:\n\nGap: ${gap}\nClinical Evidence: ${clinicalEvidence}`,
      maxTokens: 1000,
    })
    const query = JSON.parse(responseText)

    return NextResponse.json({ success: true, query })
  } catch (error) {
    console.error('Query generation error:', error)
    return NextResponse.json({ error: 'Query generation failed' }, { status: 500 })
  }
}
