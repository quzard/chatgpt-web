<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NInput, NSelect, NSlider, useMessage } from 'naive-ui'
import { isNotEmptyString } from '../../../../service/src/utils/is'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'

const settingStore = useSettingStore()

const ms = useMessage()

const OPENAI_API_KEY = ref(settingStore.OPENAI_API_KEY ?? '')

const systemMessage = ref(settingStore.systemMessage ?? '')

const model = ref(settingStore.model ?? 'gpt-3.5-turbo')

const temperature = ref(settingStore.temperature ?? 0.5)

const top_p = ref(settingStore.top_p ?? 1)

const ALL_MODELS = isNotEmptyString(import.meta.env.VITE_OPENAI_API_MODEL)
  ? import.meta.env.VITE_OPENAI_API_MODEL.split(',').map(name => ({
    label: name,
    value: name,
  }))
  : [
      {
        label: 'gpt-3.5-turbo',
        value: 'gpt-3.5-turbo',
      },
    ]

function updateSettings(options: Partial<SettingsState>) {
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}

function handleReset() {
  settingStore.resetSetting()
  ms.success(t('common.success'))
  window.location.reload()
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.model') }}</span>
        <div class="flex-1">
          <NSelect v-model:value="model" :options="ALL_MODELS" :autosize="{ minRows: 1, maxRows: 4 }" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ model })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.role') }}</span>
        <div class="flex-1">
          <NInput v-model:value="systemMessage" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ systemMessage })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.OPENAI_API_KEY') }}</span>
        <div class="flex-1">
          <NInput v-model:value="OPENAI_API_KEY" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ OPENAI_API_KEY })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.temperature') }} </span>
        <div class="flex-1">
          <NSlider v-model:value="temperature" :max="2" :min="0" :step="0.1" />
        </div>
        <span>{{ temperature }}</span>
        <NButton size="tiny" text type="primary" @click="updateSettings({ temperature })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.top_p') }} </span>
        <div class="flex-1">
          <NSlider v-model:value="top_p" :max="1" :min="0" :step="0.1" />
        </div>
        <span>{{ top_p }}</span>
        <NButton size="tiny" text type="primary" @click="updateSettings({ top_p })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">&nbsp;</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>
    </div>
  </div>
</template>
