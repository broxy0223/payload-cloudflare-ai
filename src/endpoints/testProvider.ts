import type { Endpoint, PayloadRequest } from 'payload'

import type { PluginConfig } from '../types.js'

import { buildGatewayBaseURL, gatewayHeaders, isGatewayConfigured } from '../ai/gateway.js'
import { PLUGIN_API_ENDPOINT_BASE } from '../defaults.js'
import { AI_SETTINGS_SLUG } from '../globals/AISettings.js'

/**
 * POST /api/plugin-ai/test-provider
 *
 * Tests connectivity to a provider through the CF AI Gateway.
 * Sends a minimal request and returns success/fail status.
 * Updates the provider's status in the AI Settings global.
 */
export const testProviderEndpoint = (pluginConfig: PluginConfig): Endpoint => ({
  handler: async (req: PayloadRequest) => {
    try {
      if (!req.user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        })
      }

      if (pluginConfig.access?.settings) {
        const hasAccess = await pluginConfig.access.settings({ req })
        if (!hasAccess) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 403,
          })
        }
      }

      if (!isGatewayConfigured()) {
        return new Response(
          JSON.stringify({
            error: 'AI Gateway not configured. Set CLOUDFLARE_ACCOUNT_ID, AI_GATEWAY_NAME, and AI_GATEWAY_TOKEN.',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      }

      const data = await req.json?.()
      const { providerSlug } = data || {}

      if (!providerSlug) {
        return new Response(JSON.stringify({ error: 'providerSlug is required' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      const baseURL = buildGatewayBaseURL(providerSlug)
      if (!baseURL) {
        return new Response(JSON.stringify({ error: 'Could not build gateway URL' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Send a minimal models list request to test connectivity
      // Most OpenAI-compatible providers support GET /models
      const testURL = `${baseURL}/models`
      const headers = gatewayHeaders()

      let connected = false
      let statusMessage = ''

      try {
        const response = await fetch(testURL, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        })

        if (response.ok || response.status === 200) {
          connected = true
          statusMessage = 'Connected'
        } else if (response.status === 401 || response.status === 403) {
          statusMessage = 'BYOK key missing or invalid for this provider'
        } else {
          statusMessage = `Provider returned status ${response.status}`
        }
      } catch (fetchError) {
        statusMessage = `Connection failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
      }

      // Update the AI Settings global with the test result
      try {
        const settings = await req.payload.findGlobal({
          slug: AI_SETTINGS_SLUG,
        })

        const providers = (settings.providers || []) as Array<{
          enabled: boolean
          lastTested?: string
          providerSlug: string
          status: string
        }>

        const updatedProviders = providers.map((p) => {
          if (p.providerSlug === providerSlug) {
            return {
              ...p,
              lastTested: new Date().toISOString(),
              status: connected ? 'connected' : 'failed',
            }
          }
          return p
        })

        await req.payload.updateGlobal({
          slug: AI_SETTINGS_SLUG,
          data: {
            providers: updatedProviders,
          },
        })
      } catch (updateError) {
        req.payload.logger.error(updateError, '— AI Plugin: Error updating provider status')
      }

      return new Response(
        JSON.stringify({
          connected,
          message: statusMessage,
          provider: providerSlug,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return new Response(JSON.stringify({ error: message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  },
  method: 'post',
  path: `${PLUGIN_API_ENDPOINT_BASE}/test-provider`,
})
