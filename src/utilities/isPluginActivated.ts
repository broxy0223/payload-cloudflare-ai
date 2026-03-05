import type { PluginConfig } from '../types.js'

import { isGatewayConfigured } from '../ai/gateway.js'
import { getGenerationModels } from './getGenerationModels.js'

export const isPluginActivated = (pluginConfig: PluginConfig) => {
  // Plugin is active if either: models are available OR gateway is configured (BYOK mode)
  if (isGatewayConfigured()) return true
  return (getGenerationModels(pluginConfig) ?? []).length > 0
}
