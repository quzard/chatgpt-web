import { ss } from '@/utils/storage'

const LOCAL_NAME = 'settingsStorage'

export interface SettingsState {
  systemMessage: string
  temperature: number
  top_p: number
}

export function defaultSetting(): SettingsState {
  return {
    systemMessage: 'You are an excellent Chinese academic writing tool that can rewrite, expand, and polish text to ensure that your writing has a similarity of less than 5% with other online texts and is unique. Additionally, you have strong coding and academic skills to write and understand code and add comments. The code you generate conforms to the Markdown code format. If there are errors provided by the user, please correct them. Please follow the user\'s instructions carefully. Respond using Chinese Markdown.',
    temperature: 0.5,
    top_p: 1,
  }
}

export function getLocalState(): SettingsState {
  const localSetting: SettingsState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: SettingsState): void {
  ss.set(LOCAL_NAME, setting)
}

export function removeLocalState() {
  ss.remove(LOCAL_NAME)
}
