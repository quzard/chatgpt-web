import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
  systemMessage: string
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  let currentDate = new Date().toISOString().split('T')[0]
  return {
    userInfo: {
      avatar: 'https://raw.githubusercontent.com/quzard/chatgpt-web/main/src/assets/avatar.jpg',
      name: 'quzard',
      description: 'Star on <a href="https://github.com/quzard/chatgpt-bot" class="text-blue-500" target="_blank" >Github</a>',
      systemMessage: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
