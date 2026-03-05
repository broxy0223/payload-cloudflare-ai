import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const DeepSeekConfig = createOpenAICompatibleConfig({
  defaultModel: 'deepseek-chat',
  envApiKey: 'DEEPSEEK_API_KEY',
  envBaseURL: 'DEEPSEEK_BASE_URL',
  gatewaySlug: 'deepseek',
  modelKey: 'DSEEK',
  models: [
    'deepseek-chat',
    'deepseek-reasoner',
  ],
  providerLabel: 'DeepSeek',
  providerName: 'DeepSeek',
})
