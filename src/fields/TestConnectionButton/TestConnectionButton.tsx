'use client'

import { useConfig, useField } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

import { PLUGIN_API_ENDPOINT_BASE } from '../../defaults.js'

type TestStatus = 'idle' | 'loading' | 'connected' | 'failed'

export const TestConnectionButton: React.FC<{ path: string }> = ({ path }) => {
  const [status, setStatus] = useState<TestStatus>('idle')
  const [message, setMessage] = useState('')

  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()

  // Derive the providerSlug field path from this field's path
  // path is like "providers.0.testConnection" → we need "providers.0.providerSlug"
  const parentPath = path.split('.').slice(0, -1).join('.')
  const { value: providerSlug } = useField<string>({ path: `${parentPath}.providerSlug` })

  const handleTest = useCallback(async () => {
    if (!providerSlug) return
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(`${serverURL}${api}${PLUGIN_API_ENDPOINT_BASE}/test-provider`, {
        body: JSON.stringify({ providerSlug }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      const data = await res.json()

      if (data.connected) {
        setStatus('connected')
        setMessage(data.message || 'Connected')
      } else {
        setStatus('failed')
        setMessage(data.message || data.error || 'Connection failed')
      }
    } catch (err) {
      setStatus('failed')
      setMessage(err instanceof Error ? err.message : 'Request failed')
    }
  }, [providerSlug, serverURL, api])

  const statusColor =
    status === 'connected' ? '#22c55e' : status === 'failed' ? '#ef4444' : undefined

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '8px', paddingTop: '28px' }}>
      <button
        disabled={status === 'loading' || !providerSlug}
        onClick={handleTest}
        style={{
          background: 'none',
          border: '1px solid var(--theme-elevation-300)',
          borderRadius: '4px',
          color: 'var(--theme-text)',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          fontSize: '13px',
          padding: '4px 12px',
          whiteSpace: 'nowrap',
        }}
        type="button"
      >
        {status === 'loading' ? 'Testing...' : 'Test Connection'}
      </button>
      {message && (
        <span style={{ color: statusColor, fontSize: '13px' }}>{message}</span>
      )}
    </div>
  )
}
