/**
 * Aggregates text-capable models from all providers into a flat options list
 * for use in AI Settings operation default dropdowns.
 *
 * Format: { label: "Provider — model-name", value: "providerKey:model-name" }
 */

// Anthropic
const ANTHROPIC_MODELS = [
  'claude-opus-4-1',
  'claude-opus-4-0',
  'claude-sonnet-4-0',
  'claude-3-opus-latest',
  'claude-3-5-haiku-latest',
  'claude-3-5-sonnet-latest',
  'claude-3-7-sonnet-latest',
]

// OpenAI
const OPENAI_MODELS = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4o-mini',
  'gpt-3.5-turbo',
]

// Google
const GOOGLE_MODELS = [
  'gemini-3-pro-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
]

// Groq
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-guard-3-8b',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]

// Mistral
const MISTRAL_MODELS = [
  'mistral-large-latest',
  'mistral-medium-latest',
  'mistral-small-latest',
  'codestral-latest',
  'open-mixtral-8x22b',
  'open-mistral-nemo',
]

// Perplexity
const PERPLEXITY_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-reasoning-pro',
  'sonar-reasoning',
  'sonar-deep-research',
]

// OpenRouter
const OPENROUTER_MODELS = [
  'anthropic/claude-sonnet-4',
  'anthropic/claude-haiku-3.5',
  'google/gemini-2.5-flash',
  'meta-llama/llama-3.3-70b-instruct',
  'mistralai/mistral-large',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'deepseek/deepseek-chat-v3',
]

// DeepSeek
const DEEPSEEK_MODELS = [
  'deepseek-chat',
  'deepseek-reasoner',
]

// xAI
const XAI_MODELS = [
  'grok-3',
  'grok-3-mini',
  'grok-2',
]

export const allModelOptions = [
  ...ANTHROPIC_MODELS.map((m) => ({ label: `Anthropic — ${m}`, value: `anthropic:${m}` })),
  ...OPENAI_MODELS.map((m) => ({ label: `OpenAI — ${m}`, value: `openai:${m}` })),
  ...GOOGLE_MODELS.map((m) => ({ label: `Google — ${m}`, value: `google:${m}` })),
  ...GROQ_MODELS.map((m) => ({ label: `Groq — ${m}`, value: `groq:${m}` })),
  ...MISTRAL_MODELS.map((m) => ({ label: `Mistral — ${m}`, value: `mistral:${m}` })),
  ...PERPLEXITY_MODELS.map((m) => ({ label: `Perplexity — ${m}`, value: `perplexity:${m}` })),
  ...OPENROUTER_MODELS.map((m) => ({ label: `OpenRouter — ${m}`, value: `openrouter:${m}` })),
  ...DEEPSEEK_MODELS.map((m) => ({ label: `DeepSeek — ${m}`, value: `deepseek:${m}` })),
  ...XAI_MODELS.map((m) => ({ label: `xAI — ${m}`, value: `xai:${m}` })),
]

/**
 * Maps provider keys (from "provider:model" values) to GenerationModel IDs.
 * Used by resolveModel to find the right handler for a selected model.
 */
export const PROVIDER_TO_MODEL_ID: Record<string, string> = {
  anthropic: 'ANTH-C-text',
  deepseek: 'DSEEK-text',
  google: 'GEMINI-text',
  groq: 'GROQ-text',
  mistral: 'MISTRAL-text',
  openai: 'Oai-text',
  openrouter: 'ORTR-text',
  perplexity: 'PPLX-text',
  xai: 'XAI-text',
}
