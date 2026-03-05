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
        provider(options.model),
      )
    },
    output: 'text',
    settings: {
      name: `${config.modelKey}-text-settings`,
      type: 'group',
      admin: {
        condition(data) {
          return data['model-id'] === `${config.modelKey}-text`
        },
      },
      fields: [
        {
          name: 'model',
          type: 'select',
          defaultValue: config.defaultModel,
          label: 'Model',
          options: config.models,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'maxTokens',
              type: 'number',
              defaultValue: 5000,
            },
            {
              name: 'temperature',
              type: 'number',
              defaultValue: 0.7,
              max: 1,
              min: 0,
            },
          ],
        },
        {
          name: 'extractAttachments',
          type: 'checkbox',
        },
      ],
      label: `${config.providerLabel} Settings`,
    },
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
        provider(options.model),
      )
    },
    output: 'text',
    settings: {
      name: `${config.modelKey}-object-settings`,
      type: 'group',
      admin: {
        condition(data) {
          return data['model-id'] === `${config.modelKey}-object`
        },
      },
      fields: [
        {
          name: 'model',
          type: 'select',
          defaultValue: config.defaultModel,
          label: 'Model',
          options: config.models,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'maxTokens',
              type: 'number',
              defaultValue: 5000,
            },
            {
              name: 'temperature',
              type: 'number',
              defaultValue: 0.7,
              max: 1,
              min: 0,
            },
          ],
        },
        {
          name: 'extractAttachments',
          type: 'checkbox',
        },
      ],
      label: `${config.providerLabel} Settings`,
    },
  }

  return {
    models: [textModel, objectModel],
    provider: config.providerName,
  }
}
