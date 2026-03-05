# Payload AI Gateway Plugin — Setup Guide

## Overview

This plugin adds AI-powered content generation to your PayloadCMS admin panel, routed through Cloudflare AI Gateway for logging, caching, rate limiting, and cost tracking. All provider API keys are stored securely in the gateway (BYOK) — no secrets in your application code.

**Supported Providers:** All providers supported by Cloudflare AI Gateway — OpenAI, Anthropic, Google AI Studio, Azure OpenAI, Amazon Bedrock, Groq, Mistral, Perplexity, Cohere, OpenRouter, Workers AI, HuggingFace, Replicate, xAI (Grok), DeepSeek, and more as Cloudflare adds them

**Supported Operations:** Compose, Translate, Proofread, Summarize, Expand, Simplify, Rephrase, Tone Adjustment, Image Generation

---

## Prerequisites

Before installing the plugin, you need:

1. A **Cloudflare account** with Workers enabled
2. A **Cloudflare AI Gateway** created in the dashboard
3. **BYOK (Bring Your Own Key)** — provider API keys stored in the gateway
4. **Gateway authentication** enabled with a token
5. A **PayloadCMS 3.x** project deployed on Cloudflare Workers

---

## Step 1: Create AI Gateway

1. Go to **Cloudflare Dashboard > AI > AI Gateway**
2. Click **Create Gateway**
3. Name it (e.g., `my-gateway`)
4. Note the gateway name — you'll need it for plugin configuration

---

## Step 2: Add Provider API Keys (BYOK)

In your AI Gateway settings, add API keys for the providers you want to use:

| Provider | Where to Get Key | Gateway Provider Slug |
|----------|------------------|-----------------------|
| OpenAI | [platform.openai.com](https://platform.openai.com) | `openai` |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | `anthropic` |
| Google AI Studio | [aistudio.google.com](https://aistudio.google.com) | `google-ai-studio` |
| Azure OpenAI | Azure Portal | `azure-openai` |
| Amazon Bedrock | AWS Console | `amazon-bedrock` |
| Groq | [console.groq.com](https://console.groq.com) | `groq` |
| Mistral | [console.mistral.ai](https://console.mistral.ai) | `mistral` |
| Perplexity | [perplexity.ai/settings/api](https://perplexity.ai/settings/api) | `perplexity` |
| Cohere | [dashboard.cohere.com](https://dashboard.cohere.com) | `cohere` |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | `openrouter` |
| Workers AI | Cloudflare Dashboard | `workers-ai` |
| HuggingFace | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | `huggingface` |
| Replicate | [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) | `replicate` |
| xAI (Grok) | [console.x.ai](https://console.x.ai) | `grok` |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com) | `deepseek` |

You only need to add keys for providers you want to use. Keys are stored encrypted in the gateway. Your application never sees them.

The plugin auto-detects which providers are available by testing gateway connectivity. As Cloudflare adds new providers to AI Gateway, they become available automatically.

---

## Step 3: Enable Gateway Authentication

**This plugin requires an authenticated gateway.** Unauthenticated gateways are not supported.

1. In your gateway settings, enable **Authentication**
2. Create a gateway token
3. Store the token as a Worker secret:

```bash
npx wrangler secret put AI_GATEWAY_TOKEN
# Paste your gateway token when prompted
```

This is the only secret your Worker needs. No provider API keys required.

---

## Step 4: Install the Plugin

```bash
pnpm add @zeroarc/payload-ai-gateway
```

---

## Step 5: Configure in payload.config.ts

```typescript
import { payloadAiGateway } from '@zeroarc/payload-ai-gateway'

export default buildConfig({
  // ... your existing config
  plugins: [
    // ... your existing plugins
    payloadAiGateway({
      gateway: 'my-gateway',  // Your AI Gateway name
      collections: {
        pages: true,   // Enable AI on these collections
        posts: true,
      },
    }),
  ],
})
```

The plugin reads `CLOUDFLARE_ACCOUNT_ID` from your Worker environment (already set if you're deploying on Cloudflare) and constructs gateway URLs automatically.

---

## Step 6: Run Migration

The plugin creates an Instructions collection for managing AI prompt templates.

```bash
npx payload migrate:create add_ai_plugin
npx payload migrate
```

---

## Step 7: Deploy

```bash
pnpm build
npx wrangler deploy
```

---

## Step 8: Configure in Admin Panel

1. Log into your Payload admin panel
2. Click **AI Settings** in the sidebar
3. The plugin auto-detects your gateway and tests each provider
4. You'll see which providers are available (based on your BYOK keys)
5. Toggle providers on/off
6. Set default models per operation:

| Operation | Recommended Default | Why |
|-----------|--------------------|-----|
| Compose | Anthropic Claude Sonnet | Best at long-form content |
| Translate | Google Gemini Flash | Fast and cheap for translation |
| Proofread | Anthropic Claude Sonnet | Nuanced grammar and style |
| Summarize | Google Gemini Flash | Quick summarization |
| Expand | Anthropic Claude Sonnet | Creative expansion |
| Research | Perplexity Sonar Pro | Grounded in web sources |

7. Click **Save**

---

## Step 9: Start Using

Editors can now:

- Click the AI icon on any enabled text/rich text field
- Choose an operation (Compose, Translate, Proofread, etc.)
- Optionally override the model from the dropdown
- Generate content that streams in real-time

---

## Configuration Reference

### Plugin Options

```typescript
payloadAiGateway({
  // Required
  gateway: string,              // AI Gateway name

  // Collections/globals to enable AI on
  collections: {
    [slug: string]: boolean
  },
  globals?: {
    [slug: string]: boolean
  },

  // Optional
  accountId?: string,           // CF Account ID (auto-detected from env)
  debug?: boolean,              // Show Instructions collection in sidebar
})
```

### Environment Variables

| Variable | Required | How to Set |
|----------|----------|------------|
| `AI_GATEWAY_TOKEN` | Yes | `wrangler secret put AI_GATEWAY_TOKEN` |
| `CLOUDFLARE_ACCOUNT_ID` | Auto-detected | Usually already in your wrangler config |

That's it. No `OPENAI_API_KEY`, no `ANTHROPIC_API_KEY`, no provider secrets.

---

## How It Works

```
Editor clicks "Compose"
        |
        v
Plugin reads AI Settings (which provider, which model)
        |
        v
Request sent to: gateway.ai.cloudflare.com/v1/{account}/{gateway}/{provider}
  with header: cf-aig-authorization: Bearer {AI_GATEWAY_TOKEN}
        |
        v
AI Gateway:
  - Authenticates the request
  - Injects BYOK API key for the provider
  - Logs the request (tokens, cost, latency)
  - Checks cache (returns cached response if available)
  - Applies rate limits
  - Forwards to provider API
        |
        v
Response streams back to editor
```

---

## AI Gateway Features You Get

| Feature | What It Does | Configuration |
|---------|-------------|---------------|
| **Logging** | Every AI request logged with tokens, cost, latency | Automatic |
| **Analytics** | Dashboard with usage trends, cost breakdown | Automatic |
| **Caching** | Identical requests served from edge | Enable in gateway settings |
| **Rate Limiting** | Prevent runaway AI usage | Set in gateway settings |
| **Cost Tracking** | Per-request cost estimation | Automatic |
| **Fallbacks** | If one provider fails, try another | Configured per-operation in AI Settings |
| **Guardrails** | Content moderation on prompts/responses | Enable in gateway settings |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "AI Gateway unreachable" | Check `AI_GATEWAY_TOKEN` is set. Verify gateway exists in CF dashboard. |
| Provider shows red X in settings | BYOK key not configured for that provider. Add it in CF dashboard > AI Gateway. |
| "Authentication failed" | Gateway token is invalid or expired. Regenerate in CF dashboard. |
| AI features don't appear on fields | Check that the collection is listed in `collections: { ... }` in plugin config. |
| Slow responses | Enable caching in gateway settings. Check provider status. |

---

## Security

- **No API keys in your codebase.** All provider keys stored in CF AI Gateway (BYOK).
- **Gateway authentication required.** Every request validated with `AI_GATEWAY_TOKEN`.
- **Admin access only.** AI features require authenticated Payload admin user by default.
- **Rate limiting.** Configure in gateway settings to prevent abuse.
- **Audit trail.** Every AI request logged in gateway with user, model, tokens, cost.
