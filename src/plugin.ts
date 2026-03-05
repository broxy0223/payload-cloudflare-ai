import type { CollectionConfig, Config, GlobalConfig } from 'payload'

import { deepMerge } from 'payload/shared'

import type { PluginConfig } from './types.js'

import { defaultGenerationModels } from './ai/models/index.js'
import { lexicalJsonSchema } from './ai/schemas/lexicalJsonSchema.js'
import { instructionsCollection } from './collections/Instructions.js'
import { PLUGIN_NAME } from './defaults.js'
import { fetchFields } from './endpoints/fetchFields.js'
import { endpoints } from './endpoints/index.js'
import { testProviderEndpoint } from './endpoints/testProvider.js'
import { aiSettingsGlobal } from './globals/AISettings.js'
import { init } from './init.js'
import { translations } from './translations/index.js'
import { getGenerationModels } from './utilities/getGenerationModels.js'
import { isPluginActivated } from './utilities/isPluginActivated.js'
import { updateFieldsConfig } from './utilities/updateFieldsConfig.js'

const defaultPluginConfig: PluginConfig = {
  access: {
    generate: ({ req }) => !!req.user,
    settings: ({ req }) => !!req.user,
  },
  collections: {},
  disableSponsorMessage: false,
  generatePromptOnInit: true,
  generationModels: defaultGenerationModels,
}

const startupMessage = `
╔═══════════════════════════════════════════════════════════════╗
║       PAYLOAD CLOUDFLARE AI GATEWAY PLUGIN                    ║
║                                                               ║
║  All AI operations route through Cloudflare AI Gateway.       ║
║  Authentication required by default for all AI features.      ║
║                                                               ║
║  Configure providers in Admin > AI Settings.                  ║
║                                                               ║
║  Forked from @ai-stack/payloadcms by ashbuilds.               ║
║  Support the original author:                                 ║
║    • https://buymeacoffee.com/ashbuilds                       ║
║    • https://github.com/sponsors/ashbuilds                    ║
║                                                               ║
║  Issues: https://github.com/broxy0223/payload-cloudflare-ai  ║
╚═══════════════════════════════════════════════════════════════╝
`

const isLocalizationEnabled = (config: Config['localization']) => {
  return (
    config !== false &&
    typeof config === 'object' &&
    config !== null &&
    'locales' in config &&
    Array.isArray(config.locales) &&
    config.locales.length > 0
  )
}

const extractLocales = (
  config: Config['localization'],
): { defaultLocale?: string; locales: string[] } => {
  if (
    config &&
    typeof config === 'object' &&
    'locales' in config &&
    Array.isArray(config.locales)
  ) {
    return {
      defaultLocale:
        'defaultLocale' in config && typeof config.defaultLocale === 'string'
          ? config.defaultLocale
          : undefined,
      locales: config.locales.map((locale) =>
        typeof locale === 'string' ? locale : (locale as { code: string }).code,
      ),
    }
  }
  return { locales: [] }
}

const payloadAiPlugin =
  (pluginConfig: PluginConfig) =>
  (incomingConfig: Config): Config => {
    const localizationConfig = incomingConfig.localization
    const hasLocalization = isLocalizationEnabled(localizationConfig)
    const localizationData = hasLocalization ? extractLocales(localizationConfig) : { locales: [] }

    pluginConfig = {
      ...defaultPluginConfig,
      ...pluginConfig,
      _localization: hasLocalization
        ? {
            enabled: true,
            ...localizationData,
          }
        : {
            enabled: false,
            locales: [],
          },
      access: {
        ...defaultPluginConfig.access,
        ...pluginConfig.access,
      },
    }

    pluginConfig.generationModels = getGenerationModels(pluginConfig)

    const isActivated = isPluginActivated(pluginConfig)
    let updatedConfig: Config = { ...incomingConfig }
    const collectionsFieldPathMap: Record<
      string,
      { label: string; relationTo?: string; type: string }
    > = {}

    if (isActivated) {
      const Instructions = instructionsCollection(pluginConfig)
      // Inject editor schema to config, so that it can be accessed when /textarea endpoint will hit
      const lexicalSchema = lexicalJsonSchema(pluginConfig.editorConfig?.nodes)

      Instructions.admin = {
        ...Instructions.admin,
      }

      if (pluginConfig.debugging) {
        Instructions.admin.hidden = false
      }

      Instructions.admin.custom = {
        ...(Instructions.admin.custom || {}),
        [PLUGIN_NAME]: {
          editorConfig: {
            // Used in admin client for useObject hook
            schema: lexicalSchema,
          },
        },
      }

      const AISettings = aiSettingsGlobal(pluginConfig)
      const collections = [...(incomingConfig.collections ?? []), Instructions]
      const globals = [...(incomingConfig.globals ?? []), AISettings]
      const { collections: collectionSlugs, globals: globalsSlugs } = pluginConfig

      const { components: { providers = [] } = {} } = incomingConfig.admin || {}
      const updatedProviders = [
        ...(providers ?? []),
        {
          path: 'payload-cloudflare-ai/client#InstructionsProvider',
        },
      ]

      incomingConfig.admin = {
        ...(incomingConfig.admin || {}),
        components: {
          ...(incomingConfig.admin?.components ?? {}),
          providers: updatedProviders,
        },
      }

      const pluginEndpoints = endpoints(pluginConfig)

      const processedCollections = collections.map((collection) => {
        if (collectionSlugs[collection.slug]) {
          const { schemaPathMap, updatedCollectionConfig } = updateFieldsConfig(collection)
          Object.assign(collectionsFieldPathMap, schemaPathMap)
          return updatedCollectionConfig as CollectionConfig
        }
        return collection
      })

      updatedConfig = {
        ...incomingConfig,
        collections: processedCollections,
        endpoints: [
          ...(incomingConfig.endpoints ?? []),
          pluginEndpoints.textarea,
          pluginEndpoints.upload,
          fetchFields(pluginConfig),
          testProviderEndpoint(pluginConfig),
        ],
        globals: globals.map((global) => {
          if (globalsSlugs?.[global.slug]) {
            const { schemaPathMap, updatedCollectionConfig } = updateFieldsConfig(global)
            Object.assign(collectionsFieldPathMap, schemaPathMap)
            return updatedCollectionConfig as GlobalConfig
          }
          return global
        }),
        i18n: {
          ...(incomingConfig.i18n || {}),
          translations: {
            ...deepMerge(translations, incomingConfig.i18n?.translations ?? {}),
          },
        },
      }
    }

    updatedConfig.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }

      if (!isActivated) {
        payload.logger.warn(`— AI Plugin: Not activated. Please verify your environment keys.`)
        return
      }

      await init(payload, collectionsFieldPathMap, pluginConfig)
        .catch((error) => {
          payload.logger.error(error, `— AI Plugin: Initialization Error`)
        })
        .finally(() => {
          if (!pluginConfig.disableSponsorMessage) {
            setTimeout(() => {
              payload.logger.info(startupMessage)
            }, 1000)
          }
        })
    }

    return updatedConfig
  }

export { payloadAiPlugin }
