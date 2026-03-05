'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'

import { PLUGIN_API_ENDPOINT_BASE } from '../../defaults.js'

type AvailableModel = {
  id: string
  name: string
}

type ModelSelectorProps = {
  onChange: (modelId: string | undefined) => void
  value?: string
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onChange, value }) => {
  const [models, setModels] = useState<AvailableModel[]>([])
  const { config } = useConfig()
  const {
    routes: { api },
    serverURL,
  } = config

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${serverURL}${api}${PLUGIN_API_ENDPOINT_BASE}/fetch-fields`, {
          credentials: 'include',
          method: 'GET',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.models && Array.isArray(data.models)) {
            setModels(data.models)
          }
        }
      } catch {
        // Silently fail — selector just won't show models
      }
    }

    fetchModels()
  }, [serverURL, api])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value
      onChange(selected === '' ? undefined : selected)
    },
    [onChange],
  )

  if (models.length <= 1) {
    return null
  }

  return (
    <select
      aria-label="Select AI model"
      onChange={handleChange}
      style={{
        background: 'var(--theme-input-bg, #fff)',
        border: '1px solid var(--theme-elevation-150, #ddd)',
        borderRadius: '4px',
        color: 'var(--theme-text, #333)',
        cursor: 'pointer',
        fontSize: '12px',
        maxWidth: '160px',
        padding: '4px 8px',
      }}
      value={value || ''}
    >
      <option value="">Auto (default)</option>
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  )
}
