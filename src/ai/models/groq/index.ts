import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const GroqConfig = createOpenAICompatibleConfig({
  defaultModel: 'llama-3.3-70b-versatile',
  envApiKey: 'GROQ_API_KEY',
  envBaseURL: 'GROQ_BASE_URL',
  gatewaySlug: 'groq',
  modelKey: 'GROQ',
  models: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama-guard-3-8b',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ],
  providerLabel: 'Groq',
  providerName: 'Groq',
})
