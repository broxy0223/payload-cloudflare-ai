import type { GlobalConfig } from 'payload'

import type { PluginConfig } from '../types.js'

import { GATEWAY_PROVIDER_SLUGS } from '../ai/gateway.js'
import { allModelOptions } from '../ai/models/allModels.js'
import { PLUGIN_NAME } from '../defaults.js'

const operationNames = [
  'compose',
  'translate',
  'proofread',
  'summarize',
  'expand',
  'simplify',
  'rephrase',
  'tone',
] as const

export const AI_SETTINGS_SLUG = `${PLUGIN_NAME}-settings`

export const aiSettingsGlobal = (pluginConfig: PluginConfig): GlobalConfig => ({
  slug: AI_SETTINGS_SLUG,
  access: {
    read: pluginConfig.access?.settings || (({ req }) => !!req.user),
    update: pluginConfig.access?.settings || (({ req }) => !!req.user),
  },
  admin: {
    group: 'AI',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'gatewayName',
          type: 'text',
          admin: {
            description: 'Your Cloudflare AI Gateway name (from AI_GATEWAY_NAME env var)',
            readOnly: true,
          },
          defaultValue: process.env.AI_GATEWAY_NAME || '',
          label: 'Gateway Name',
        },
        {
          name: 'accountId',
          type: 'text',
          admin: {
            description: 'Your Cloudflare Account ID (from CLOUDFLARE_ACCOUNT_ID env var)',
            readOnly: true,
          },
          defaultValue: process.env.CLOUDFLARE_ACCOUNT_ID || '',
          label: 'Account ID',
        },
      ],
    },
    {
      name: 'providers',
      type: 'array',
      admin: {
        description: 'Providers available through your AI Gateway. Test connections to verify BYOK keys are configured.',
        isSortable: false,
      },
      defaultValue: Object.entries(GATEWAY_PROVIDER_SLUGS).map(([key]) => ({
        enabled: false,
        providerSlug: key,
        status: 'untested',
      })),
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'providerSlug',
              type: 'text',
              admin: {
                readOnly: true,
              },
              label: 'Provider',
              required: true,
            },
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enabled',
            },
            {
              name: 'testConnection',
              type: 'ui',
              admin: {
                components: {
                  Field: 'payload-cloudflare-ai/fields#TestConnectionButton',
                },
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'status',
              type: 'select',
              admin: {
                readOnly: true,
              },
              defaultValue: 'untested',
              label: 'Connection Status',
              options: [
                { label: 'Untested', value: 'untested' },
                { label: 'Connected', value: 'connected' },
                { label: 'Failed', value: 'failed' },
              ],
            },
            {
              name: 'lastTested',
              type: 'date',
              admin: {
                readOnly: true,
              },
              label: 'Last Tested',
            },
          ],
        },
      ],
      label: 'Providers',
      maxRows: Object.keys(GATEWAY_PROVIDER_SLUGS).length,
    },
    {
      name: 'operationDefaults',
      type: 'group',
      admin: {
        description: 'Set a default model for each AI operation. Editors can override per-generation.',
      },
      fields: operationNames.map((op) => ({
        name: op,
        type: 'select' as const,
        admin: {
          description: `Default model for ${op} operations`,
          isClearable: true,
        },
        label: op.charAt(0).toUpperCase() + op.slice(1),
        options: allModelOptions,
      })),
      label: 'Operation Defaults',
    },
    {
      name: 'globalDefaultModel',
      type: 'select',
      admin: {
        description: 'Fallback model used when no operation-specific default is set',
        isClearable: true,
      },
      label: 'Global Default Model',
      options: allModelOptions,
    },
  ],
  label: 'AI Settings',
})
