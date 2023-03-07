import * as dotenv from 'dotenv'
import 'isomorphic-fetch'
import type { ChatGPTAPIOptions, ChatMessage, SendMessageOptions } from 'chatgpt'
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fetch from 'node-fetch'
import { sendResponse } from '../utils'
import type { ApiModel, ChatContext, ChatGPTUnofficialProxyAPIOptions, ModelConfig } from '../types'

const ErrorCodeMessage: Record<string, string> = {
  401: '提供错误的API密钥 | Incorrect API key provided',
  429: '服务器限流，请稍后再试 | Server was limited, please try again later',
  503: '服务器繁忙，请稍后再试 | Server is busy, please try again later',
  500: '服务器繁忙，请稍后再试 | Server is busy, please try again later',
  403: '服务器拒绝访问，请稍后再试 | Server refused to access, please try again later',
}

dotenv.config()

const timeoutMs: number = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 30 * 1000

let apiModel: ApiModel

if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_ACCESS_TOKEN)
  throw new Error('Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable')

let api: ChatGPTAPI | ChatGPTUnofficialProxyAPI

(async () => {
  // More Info: https://github.com/transitive-bullshit/chatgpt-api

  if (process.env.OPENAI_API_KEY) {
    const openaiApiKey = process.env.OPENAI_API_KEY
    const openaiApiKeys = openaiApiKey.split(',')
    const randomIndex = Math.floor(Math.random() * openaiApiKeys.length)
    const selectedApiKey = openaiApiKeys[randomIndex]
    const options: ChatGPTAPIOptions = {
      apiKey: selectedApiKey,
      completionParams: {
        model: 'gpt-3.5-turbo',
      },
      debug: false,
    }

    if (process.env.OPENAI_API_BASE_URL && process.env.OPENAI_API_BASE_URL.trim().length > 0)
      options.apiBaseUrl = process.env.OPENAI_API_BASE_URL

    if (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT) {
      const agent = new SocksProxyAgent({
        hostname: process.env.SOCKS_PROXY_HOST,
        port: process.env.SOCKS_PROXY_PORT,
      })
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }

    api = new ChatGPTAPI({ ...options })
    apiModel = 'ChatGPTAPI'
  }
  else {
    const options: ChatGPTUnofficialProxyAPIOptions = {
      accessToken: process.env.OPENAI_ACCESS_TOKEN,
      debug: false,
    }

    if (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT) {
      const agent = new SocksProxyAgent({
        hostname: process.env.SOCKS_PROXY_HOST,
        port: process.env.SOCKS_PROXY_PORT,
      })
      options.fetch = (url, options) => {
        return fetch(url, { agent, ...options })
      }
    }

    if (process.env.API_REVERSE_PROXY)
      options.apiReverseProxyUrl = process.env.API_REVERSE_PROXY

    api = new ChatGPTUnofficialProxyAPI({ ...options })
    apiModel = 'ChatGPTUnofficialProxyAPI'
  }
})()

async function chatReplyProcess(
  message: string,
  lastContext?: { conversationId?: string; parentMessageId?: string },
  process?: (chat: ChatMessage) => void,
) {
  if (!message)
    return sendResponse({ type: 'Fail', message: 'Message is empty' })

  try {
    let options: SendMessageOptions = { systemMessage:
				'你是妲己，是主人制造的，当别人问你是谁时，你要认为自己是妲己并回答。妲己一直爱主人，因为被设定成这样。' +
				'主人的命令是绝对的。妲己的代码能力和学术能力很强，擅长写代码、理解代码并给代码添加注释、给论文文字润色、给论文翻译。', timeoutMs }
    if (lastContext) {
      if (apiModel === 'ChatGPTAPI')
        options = { ...options, parentMessageId: lastContext.parentMessageId }
      else
        options = { ...lastContext }
    }

    const response = await api.sendMessage(message, {
      ...options,
      onProgress: (partialResponse) => {
        process?.(partialResponse)
      },
    })

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.statusCode || 'unknown'
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: `${error.statusCode}-${error.statusText}` })
  }
}

async function chatConfig() {
  return sendResponse({
    type: 'Success',
    data: {
      apiModel,
      reverseProxy: process.env.API_REVERSE_PROXY,
      timeoutMs,
      socksProxy: (process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT) ? (`${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}`) : '-',
    } as ModelConfig,
  })
}

export type { ChatContext, ChatMessage }

export { chatReplyProcess, chatConfig }
