import type { ChatMessage } from 'chatgpt'
import type fetch from 'node-fetch'

export interface RequestOptions {
  message: string
  lastContext?: { conversationId?: string; parentMessageId?: string }
  process?: (chat: ChatMessage) => void
  model?: string
  systemMessage?: string
  OPENAI_API_KEY?: string
  temperature?: number
  top_p?: number
}

export interface SetProxyOptions {
  fetch?: typeof fetch
}

export interface UsageResponse {
  hard_limit_usd: number
}
