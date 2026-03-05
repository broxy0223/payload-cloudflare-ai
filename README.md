# Payload Cloudflare AI

AI-powered content generation for PayloadCMS, routed through **Cloudflare AI Gateway**.

No API keys in your codebase. No secrets in your Worker. All provider keys stored securely in the gateway via BYOK (Bring Your Own Key). One token authenticates everything.

---

## Supported Providers

All providers supported by Cloudflare AI Gateway:

| Provider | Models | Use Case |
|----------|--------|----------|
| **Anthropic** | Claude Opus, Sonnet, Haiku | Long-form content, nuanced writing |
| **Google AI Studio** | Gemini Pro, Flash, Imagen | Translation, summarization, images |
| **OpenAI** | GPT-4o, DALL-E, TTS | General purpose, images, audio |
| **Groq** | Llama 3.3, Mixtral | Fast inference |
| **Mistral** | Large, Medium, Codestral | European AI, code generation |
| **Perplexity** | Sonar Pro, Reasoning | Research-grounded content |
| **OpenRouter** | 200+ models | Access any model through one key |
| **DeepSeek** | Chat, Reasoner | Cost-effective reasoning |
| **xAI** | Grok 3, Grok 2 | Real-time knowledge |
| **Cohere** | Command R+ | Enterprise search and RAG |
| **Amazon Bedrock** | Various | AWS-hosted models |
| **Azure OpenAI** | GPT-4, etc. | Azure-hosted OpenAI models |
| **Workers AI** | Cloudflare models | Edge inference |
| **HuggingFace** | Open source models | Community models |
| **Replicate** | Various | Run any open model |

As Cloudflare adds new providers to AI Gateway, they become available automatically.

---

## How It Works

```
Editor clicks "Compose" in Payload admin
        |
        v
Plugin checks: editor override > operation default > global default > first available
        |
        v
Request routed to: gateway.ai.cloudflare.com/v1/{account}/{gateway}/{provider}
  with header: cf-aig-authorization: Bearer {token}
        |
        v
AI Gateway: authenticates, injects BYOK key, logs, caches, rate limits
        |
        v
Response streams back to editor
```

---

## Features

**Content Operations:** Compose, Translate, Proofread, Summarize, Expand, Simplify, Rephrase, Tone adjustment

**Image Generation:** DALL-E, GPT-Image-1, Google Imagen

**Audio Generation:** OpenAI TTS, ElevenLabs

**Admin Panel:**
- AI Settings page — configure providers, set per-operation defaults
- Test Connection — verify BYOK keys for each provider
- Model Selector — editors choose which model to use per generation
- Per-operation routing — Compose uses Claude, Translate uses Gemini, etc.

**Gateway Benefits (automatic):**
- Request logging with token counts and cost
- Analytics dashboard
- Response caching at the edge
- Rate limiting
- Content guardrails

---

## Quick Start

### 1. Create AI Gateway

Cloudflare Dashboard > AI > AI Gateway > Create Gateway

### 2. Add Provider Keys (BYOK)

In your gateway settings, add API keys for providers you want. Keys are encrypted and stored in the gateway — your app never sees them.

### 3. Enable Authentication

In gateway settings, enable Authentication and create a token.

### 4. Set Worker Secret

```bash
npx wrangler secret put AI_GATEWAY_TOKEN
```

### 5. Install

```bash
pnpm add payload-cloudflare-ai
```

### 6. Configure

```typescript
import { payloadAiPlugin } from 'payload-cloudflare-ai'

export default buildConfig({
  plugins: [
    payloadAiPlugin({
      collections: {
        pages: true,
        posts: true,
      },
    }),
  ],
})
```

### 7. Set Environment Variables

```env
AI_GATEWAY_NAME=your-gateway-name
AI_GATEWAY_TOKEN=your-gateway-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

That's it. No `OPENAI_API_KEY`, no `ANTHROPIC_API_KEY`, no provider secrets in your app.

---

## Full Setup Guide

See **[docs/SETUP.md](docs/SETUP.md)** for complete step-by-step instructions including migration, deployment, admin configuration, and troubleshooting.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AI_GATEWAY_TOKEN` | Yes | Authenticates requests to CF AI Gateway |
| `AI_GATEWAY_NAME` | Yes | Your gateway name |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Your CF account ID |

No provider API keys needed. BYOK handles that.

---

## Configuration

```typescript
payloadAiPlugin({
  // Collections to enable AI on
  collections: { pages: true, posts: true },
  globals: { homepage: true },

  // Access control
  access: {
    generate: ({ req }) => req.user?.role === 'admin',
    settings: ({ req }) => req.user?.role === 'admin',
  },

  // Development
  debugging: false,
  generatePromptOnInit: true,
})
```

---

## Security

- No API keys in your codebase or Worker secrets
- Gateway authentication mandatory (plugin won't activate without token)
- All AI features require authenticated admin user by default
- Every request logged in gateway with user, model, tokens, cost
- Rate limiting configurable in gateway settings

---

## Attribution

This plugin is forked from [@ai-stack/payloadcms](https://github.com/ashbuilds/payload-ai) by **ashbuilds**, who built the original Payload AI plugin. If the original plugin helped you, consider supporting the author:

<a href="https://www.buymeacoffee.com/ashbuilds" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217" />
</a>

---

## License

MIT
