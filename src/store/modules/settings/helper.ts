import { ss } from '@/utils/storage'

const LOCAL_NAME = 'settingsStorage'

interface systemMessagePerChat {
  uuid: number
  message: string
}

interface OldSettingsState {
  model: string
  OPENAI_API_KEY: string
  systemMessage: string
  systemMessageAllChat?: systemMessagePerChat[]
  temperature?: number
  top_p?: number
}

export interface SettingsState {
  model: string
  OPENAI_API_KEY: string
  systemMessage: string
  temperature: number
  top_p: number
  perChatSettings: { uuid: number; settings: Chat.ConversationConfig }[]
}

function migrateSettings(oldSettings: OldSettingsState): SettingsState {
  const newSettings: SettingsState = defaultSetting()
  newSettings.systemMessage = oldSettings.systemMessage
  newSettings.temperature = oldSettings.temperature || newSettings.temperature
  newSettings.top_p = oldSettings.top_p || newSettings.top_p
	newSettings.model = oldSettings.model || newSettings.model
	newSettings.OPENAI_API_KEY = oldSettings.OPENAI_API_KEY || newSettings.OPENAI_API_KEY
	oldSettings.systemMessageAllChat?.forEach((item) => {
    // assign systemMessagePerChat to apiSettingsPerChat
    newSettings.perChatSettings.push(
      {
        uuid: item.uuid,
        settings: {
	        model: newSettings.model,
	        OPENAI_API_KEY: newSettings.OPENAI_API_KEY,
          systemMessage: item.message,
          temperature: newSettings.temperature,
          top_p: newSettings.top_p,
        },
      },
    )
  })
  // save new settings
  setLocalState(newSettings)
  return newSettings
}

export function defaultSetting(): SettingsState {
  return {
    model: 'gpt-3.5-turbo',
    OPENAI_API_KEY: '',
    systemMessage: 'You are a useful assistant. Follow the user\'s instructions carefully. Respond using markdown.',
    temperature: 0.8,
    top_p: 1,
    perChatSettings: [],
  }
}

export function getLocalState(): SettingsState {
  const localSetting: SettingsState | OldSettingsState | undefined = ss.get(LOCAL_NAME)
  // if localSetting is OldSettingsState, migrate it to SettingsState
  if (localSetting && 'systemMessageAllChat' in localSetting) {
    const newSetting: SettingsState = migrateSettings(localSetting)
    return { ...defaultSetting(), ...newSetting }
  }
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: SettingsState): void {
  ss.set(LOCAL_NAME, setting)
}

export function removeLocalState() {
  ss.remove(LOCAL_NAME)
}
