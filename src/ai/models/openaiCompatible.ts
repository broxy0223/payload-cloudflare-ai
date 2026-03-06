import { createOpenAI } from '@ai-sdk/openai'

import type { GenerationConfig, GenerationModel } from '../../types.js'

import { buildGatewayBaseURL, gatewayHeaders } from '../gateway.js'
import { defaultSystemPrompt } from '../prompts.js'
import { generateObject } from './generateObject.js'

interface OpenAICompatibleProviderConfig {
  defaultModel: string
  envApiKey?: string
  envBaseURL?: string
  gatewaySlug: string
  modelKey: string
  models: string[]
  providerLabel: string
  providerName: string
}

/**
 * Create a GenerationConfig for any OpenAI-compatible provider routed through CF AI Gateway.
 */
export function createOpenAICompatibleConfig(config: OpenAICompatibleProviderConfig): GenerationConfig {
  const gatewayBaseURL = buildGatewayBaseURL(config.gatewaySlug)
  const envBaseURL = config.envBaseURL ? process.env[config.envBaseURL] : undefined
  const envApiKey = config.envApiKey ? process.env[config.envApiKey] : undefined

  const provider = createOpenAI({
    apiKey: envApiKey || 'byok-via-gateway',
    baseURL: gatewayBaseURL || envBaseURL || undefined,
    headers: gatewayHeaders(),
  })

  const textModel: GenerationModel = {
    id: `${config.modelKey}-text`,
    name: config.providerLabel,
    fields: ['text', 'textarea'],
    handler: (
      prompt: string,
      options: {
        extractAttachments?: boolean
        locale?: string
        maxTokens?: number
        model: string
        schema?: Record<string, any>
        system?: string
        temperature?: number
      },
    ) => {
      return generateObject(
        prompt,
        {
          ...options,
          system: options.system || defaultSystemPrompt,
        },
        provider(options.model || config.defaultModel),
      )
    },
    output: 'text',
    // No per-instruction settings fields for OpenAI-compatible providers
    // to avoid D1's column limit. These providers use their default model.
  }

  const objectModel: GenerationModel = {
    id: `${config.modelKey}-object`,
    name: config.providerLabel,
    fields: ['richText'],
    handler: (text: string, options) => {
      return generateObject(
        text,
        {
          ...options,
          system: options.system || defaultSystemPrompt,
        },
        provider(options.model || config.defaultModel),
      )
    },
    output: 'text',
    // No per-instruction settings fields for OpenAI-compatible providers
    // to avoid D1's column limit. These providers use their default model.
  }

  return {
    models: [textModel, objectModel],
    provider: config.providerName,
  }
}
