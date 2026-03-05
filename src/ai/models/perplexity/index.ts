import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const PerplexityConfig = createOpenAICompatibleConfig({
  defaultModel: 'sonar-pro',
  envApiKey: 'PERPLEXITY_API_KEY',
  envBaseURL: 'PERPLEXITY_BASE_URL',
  gatewaySlug: 'perplexity',
  modelKey: 'PPLX',
  models: [
    'sonar-pro',
    'sonar',
    'sonar-reasoning-pro',
    'sonar-reasoning',
    'sonar-deep-research',
  ],
  providerLabel: 'Perplexity',
  providerName: 'Perplexity',
})
