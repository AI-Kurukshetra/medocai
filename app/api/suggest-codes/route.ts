import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/provider'
import { ICD10_SUGGESTION_PROMPT } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    const responseText = await callAI({
      system: ICD10_SUGGESTION_PROMPT,
      user: `Suggest ICD-10 codes for: ${description}`,
      maxTokens: 800,
    })
    const suggestions = JSON.parse(responseText)

    return NextResponse.json({ success: true, suggestions })
  } catch (error) {
    return NextResponse.json({ error: 'Code suggestion failed' }, { status: 500 })
  }
}
