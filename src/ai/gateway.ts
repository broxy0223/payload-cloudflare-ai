import * as process from 'node:process'

/**
 * Cloudflare AI Gateway provider slug registry.
 * Maps provider names to their CF AI Gateway URL slugs.
 */
export const GATEWAY_PROVIDER_SLUGS: Record<string, string> = {
  anthropic: 'anthropic',
  'azure-openai': 'azure-openai',
  bedrock: 'amazon-bedrock',
  cohere: 'cohere',
  deepseek: 'deepseek',
  google: 'google-ai-studio',
  'google-vertex': 'google-vertex-ai',
  groq: 'groq',
  huggingface: 'huggingface',
  mistral: 'mistral',
  openai: 'openai',
  openrouter: 'openrouter',
  perplexity: 'perplexity',
  replicate: 'replicate',
  'workers-ai': 'workers-ai',
  xai: 'grok',
}

/**
 * Build the full CF AI Gateway base URL for a given provider.
 *
 * Pattern: https://gateway.ai.cloudflare.com/v1/{accountId}/{gatewayName}/{providerSlug}
 */
export function buildGatewayBaseURL(providerSlug: string): string | undefined {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const gatewayName = process.env.AI_GATEWAY_NAME

  if (!accountId || !gatewayName) {
    return undefined
  }

  const slug = GATEWAY_PROVIDER_SLUGS[providerSlug] || providerSlug
  return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/${slug}`
}

/**
 * Get the gateway authentication headers.
 * Returns the cf-aig-authorization header if AI_GATEWAY_TOKEN is set.
 */
export function gatewayHeaders(): Record<string, string> {
  const token = process.env.AI_GATEWAY_TOKEN
  if (!token) {
    return {}
  }
  return {
    'cf-aig-authorization': `Bearer ${token}`,
  }
}

/**
 * Check if gateway is configured (account ID + gateway name + token all present).
 */
export function isGatewayConfigured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.AI_GATEWAY_NAME &&
    process.env.AI_GATEWAY_TOKEN
  )
}
