import * as process from 'node:process'

import type { GenerationModel } from '../../types.js'

import { isGatewayConfigured } from '../gateway.js'
import { AnthropicConfig } from './anthropic/index.js'
import { DeepSeekConfig } from './deepseek/index.js'
import { ElevenLabsConfig } from './elevenLabs/index.js'
import { GoogleConfig } from './google/index.js'
import { GroqConfig } from './groq/index.js'
import { MistralConfig } from './mistral/index.js'
import { OpenAIConfig } from './openai/index.js'
import { OpenRouterConfig } from './openrouter/index.js'
import { PerplexityConfig } from './perplexity/index.js'
import { XAIConfig } from './xai/index.js'

/**
 * Check if a provider is activated.
 *
 * A provider activates when EITHER:
 * 1. Its API key env var is set (traditional mode), OR
 * 2. The CF AI Gateway is fully configured (BYOK mode — keys are in the gateway)
 */
function isProviderActive(apiKeyEnv?: string, baseURLEnv?: string): boolean {
  if (apiKeyEnv && process.env[apiKeyEnv]) return true
  if (baseURLEnv && process.env[baseURLEnv]) return true
  return isGatewayConfigured()
}

export const defaultGenerationModels: GenerationModel[] = [
  ...(isProviderActive('OPENAI_API_KEY', 'OPENAI_BASE_URL') ? OpenAIConfig.models : []),
  ...(isProviderActive('ANTHROPIC_API_KEY') ? AnthropicConfig.models : []),
  ...(isProviderActive('GOOGLE_GENERATIVE_AI_API_KEY') ? GoogleConfig.models : []),
  ...(isProviderActive('GROQ_API_KEY', 'GROQ_BASE_URL') ? GroqConfig.models : []),
  ...(isProviderActive('MISTRAL_API_KEY', 'MISTRAL_BASE_URL') ? MistralConfig.models : []),
  ...(isProviderActive('PERPLEXITY_API_KEY', 'PERPLEXITY_BASE_URL') ? PerplexityConfig.models : []),
  ...(isProviderActive('OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL') ? OpenRouterConfig.models : []),
  ...(isProviderActive('DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL') ? DeepSeekConfig.models : []),
  ...(isProviderActive('XAI_API_KEY', 'XAI_BASE_URL') ? XAIConfig.models : []),
  ...(process.env.ELEVENLABS_API_KEY ? ElevenLabsConfig.models : []),
]
