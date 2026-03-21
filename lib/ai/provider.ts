/**
 * Unified AI provider abstraction.
 *
 * Switch providers and models via .env.local:
 *   AI_PROVIDER=claude   → Anthropic Claude (default)
 *   AI_PROVIDER=openai   → OpenAI
 *   AI_PROVIDER=gemini   → Google Gemini
 *
 *   CLAUDE_MODEL=claude-sonnet-4-20250514   (default)
 *   OPENAI_MODEL=gpt-4o                     (default)
 *   GEMINI_MODEL=gemini-2.0-flash           (default)
 */

import { anthropic, AI_MODEL as CLAUDE_DEFAULT } from './anthropic'
import { openai, OPENAI_MODEL as OPENAI_DEFAULT } from './openai'
import { gemini, GEMINI_MODEL as GEMINI_DEFAULT } from './gemini'

export type AIProvider = 'claude' | 'openai' | 'gemini'

export function getActiveProvider(): AIProvider {
  const env = process.env.AI_PROVIDER?.toLowerCase()
  if (env === 'openai') return 'openai'
  if (env === 'gemini') return 'gemini'
  return 'claude'
}

function getModel(provider: AIProvider): string {
  switch (provider) {
    case 'openai':  return process.env.OPENAI_MODEL  || OPENAI_DEFAULT
    case 'gemini':  return process.env.GEMINI_MODEL  || GEMINI_DEFAULT
    default:        return process.env.CLAUDE_MODEL  || CLAUDE_DEFAULT
  }
}

export async function callAI({
  system,
  user,
  maxTokens = 2000,
}: {
  system: string
  user: string
  maxTokens?: number
}): Promise<string> {
  const provider = getActiveProvider()
  const model = getModel(provider)

  if (provider === 'openai') {
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  }

  if (provider === 'gemini') {
    const response = await gemini.models.generateContent({
      model,
      contents: `${system}\n\n${user}`,
    })
    return response.text ?? ''
  }

  // Default: Claude
  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  })
  return message.content[0].type === 'text' ? message.content[0].text : ''
}
