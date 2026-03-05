import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const MistralConfig = createOpenAICompatibleConfig({
  defaultModel: 'mistral-large-latest',
  envApiKey: 'MISTRAL_API_KEY',
  envBaseURL: 'MISTRAL_BASE_URL',
  gatewaySlug: 'mistral',
  modelKey: 'MISTRAL',
  models: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'codestral-latest',
    'open-mixtral-8x22b',
    'open-mistral-nemo',
  ],
  providerLabel: 'Mistral AI',
  providerName: 'Mistral',
})
