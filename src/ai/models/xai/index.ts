import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const XAIConfig = createOpenAICompatibleConfig({
  defaultModel: 'grok-3',
  envApiKey: 'XAI_API_KEY',
  envBaseURL: 'XAI_BASE_URL',
  gatewaySlug: 'xai',
  modelKey: 'XAI',
  models: [
    'grok-3',
    'grok-3-mini',
    'grok-2',
  ],
  providerLabel: 'xAI Grok',
  providerName: 'xAI',
})
