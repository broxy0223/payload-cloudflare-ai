import { createOpenAICompatibleConfig } from '../openaiCompatible.js'

export const OpenRouterConfig = createOpenAICompatibleConfig({
  defaultModel: 'anthropic/claude-sonnet-4',
  envApiKey: 'OPENROUTER_API_KEY',
  envBaseURL: 'OPENROUTER_BASE_URL',
  gatewaySlug: 'openrouter',
  modelKey: 'ORTR',
  models: [
    'anthropic/claude-sonnet-4',
    'anthropic/claude-haiku-3.5',
    'google/gemini-2.5-flash',
    'meta-llama/llama-3.3-70b-instruct',
    'mistralai/mistral-large',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat-v3',
  ],
  providerLabel: 'OpenRouter',
  providerName: 'OpenRouter',
})
