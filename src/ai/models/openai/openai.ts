import { createOpenAI } from '@ai-sdk/openai'

import { buildGatewayBaseURL, gatewayHeaders } from '../../gateway.js'

const gatewayBaseURL = buildGatewayBaseURL('openai')

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'byok-via-gateway',
  baseURL: gatewayBaseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  headers: gatewayHeaders(),
})
