import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/ai/anthropic'
import { ICD10_SUGGESTION_PROMPT } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 800,
      system: ICD10_SUGGESTION_PROMPT,
      messages: [{ role: 'user', content: `Suggest ICD-10 codes for: ${description}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const suggestions = JSON.parse(responseText)

    return NextResponse.json({ success: true, suggestions })
  } catch (error) {
    return NextResponse.json({ error: 'Code suggestion failed' }, { status: 500 })
  }
}
