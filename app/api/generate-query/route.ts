import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { QUERY_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { encounterId, gap, clinicalEvidence } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1000,
      system: QUERY_GENERATION_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a physician query for this gap:\n\nGap: ${gap}\nClinical Evidence: ${clinicalEvidence}`
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const query = JSON.parse(responseText)

    return NextResponse.json({ success: true, query })
  } catch (error) {
    console.error('Query generation error:', error)
    return NextResponse.json({ error: 'Query generation failed' }, { status: 500 })
  }
}
