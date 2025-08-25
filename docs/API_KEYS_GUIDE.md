# 🔑 API Keys Guide - Free & Paid AI Providers

This guide provides detailed instructions for obtaining API keys from various AI providers, including free tier information and cost comparisons.

## 🆓 Free Tier Summary

| Provider | Free Credits | Daily Limits | Best For |
|----------|-------------|--------------|----------|
| **Groq** | 14,400 requests/day | Unlimited duration | Ultra-fast responses |
| **Google AI** | Generous limits | 15 requests/minute | Large context windows |
| **OpenAI** | $5 credit | 3 requests/minute | High-quality responses |
| **Anthropic** | Limited free tier | Varies | Complex reasoning |
| **Together AI** | $25 credit | API rate limits | Open-source models |

## 🚀 Groq (Recommended for Free Users)

**Why Groq?** Ultra-fast inference (10x faster than others) with generous free tier.

### Getting Your Groq API Key

1. **Visit**: [https://console.groq.com/](https://console.groq.com/)

2. **Sign Up**:
   - Click "Sign Up" 
   - Use Google/GitHub or email registration
   - Verify your email address

3. **Create API Key**:
   - Go to "API Keys" in the left sidebar
   - Click "Create API Key"
   - Give it a name (e.g., "AI Coding Assistant")
   - Copy the key (starts with `gsk_`)

4. **Free Tier Details**:
   - **14,400 requests per day** (resets daily)
   - **No expiration** - free forever
   - **Ultra-fast responses** (50-100 tokens/second)
   - **Models**: Llama 3.1 70B, Mixtral 8x7B, Gemma 7B

5. **Usage Tips**:
   - Perfect for code generation and explanation
   - Excellent for rapid prototyping
   - Use for high-frequency queries

### Groq Configuration
```json
{
  "aiCodingAssistant.preferredProvider": "groq",
  "aiCodingAssistant.aiMode": "online"
}
```

## 🧠 Google AI (Gemini)

**Why Google AI?** Massive context windows (up to 2M tokens) and generous free tier.

### Getting Your Google AI API Key

1. **Visit**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign In**:
   - Use your Google account
   - Accept terms of service

3. **Create API Key**:
   - Click "Create API Key"
   - Select "Create API key in new project" (recommended)
   - Copy the generated key

4. **Free Tier Details**:
   - **15 requests per minute**
   - **1 million tokens per minute**
   - **1,500 requests per day**
   - **No expiration** for free tier

5. **Models Available**:
   - **Gemini 1.5 Pro**: 2M token context, best for large codebases
   - **Gemini 1.5 Flash**: 1M token context, faster responses

### Google AI Configuration
```json
{
  "aiCodingAssistant.preferredProvider": "google",
  "aiCodingAssistant.selectedModel": "gemini-1.5-pro"
}
```

## 🤖 OpenAI (GPT-4o)

**Why OpenAI?** Industry-leading models with excellent code understanding.

### Getting Your OpenAI API Key

1. **Visit**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

2. **Sign Up**:
   - Create account with email
   - Verify phone number (required)
   - Add payment method (required, but $5 free credit provided)

3. **Create API Key**:
   - Click "Create new secret key"
   - Name it (e.g., "AI Coding Assistant")
   - Copy the key (starts with `sk-`)
   - **Important**: Save it immediately - you can't view it again

4. **Free Tier Details**:
   - **$5 free credit** for new accounts
   - **3 requests per minute** (free tier)
   - **200 requests per day** (free tier)
   - Credit expires after 3 months

5. **Cost After Free Tier**:
   - **GPT-4o**: $5/$15 per 1M input/output tokens
   - **GPT-4 Turbo**: $10/$30 per 1M tokens
   - **GPT-3.5 Turbo**: $0.50/$1.50 per 1M tokens

### OpenAI Configuration
```json
{
  "aiCodingAssistant.preferredProvider": "openai",
  "aiCodingAssistant.selectedModel": "gpt-4o"
}
```

## 🧮 Anthropic (Claude)

**Why Anthropic?** Excellent reasoning capabilities and large context windows.

### Getting Your Anthropic API Key

1. **Visit**: [https://console.anthropic.com/](https://console.anthropic.com/)

2. **Sign Up**:
   - Create account with email
   - Verify email address
   - Complete onboarding

3. **Create API Key**:
   - Go to "API Keys" section
   - Click "Create Key"
   - Name it appropriately
   - Copy the key (starts with `sk-ant-`)

4. **Free Tier Details**:
   - **Limited free tier** (varies by region)
   - **5 requests per minute**
   - **Credit required** for continued use

5. **Pricing**:
   - **Claude 3.5 Sonnet**: $3/$15 per 1M tokens
   - **Claude 3 Opus**: $15/$75 per 1M tokens
   - **Claude 3 Haiku**: $0.25/$1.25 per 1M tokens

### Anthropic Configuration
```json
{
  "aiCodingAssistant.preferredProvider": "anthropic",
  "aiCodingAssistant.selectedModel": "claude-3-5-sonnet-20241022"
}
```

## 🤝 Together AI (Open Source Models)

**Why Together AI?** Access to open-source models with competitive pricing.

### Getting Your Together AI API Key

1. **Visit**: [https://api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)

2. **Sign Up**:
   - Create account
   - Verify email

3. **Create API Key**:
   - Click "Create new API key"
   - Name it
   - Copy the key

4. **Free Tier Details**:
   - **$25 free credit** for new users
   - **Various rate limits** by model
   - **Open-source models** available

### Together AI Configuration
```json
{
  "aiCodingAssistant.preferredProvider": "together",
  "aiCodingAssistant.selectedModel": "meta-llama/Llama-3-70b-chat-hf"
}
```

## 💡 Recommended Configurations

### For Maximum Free Usage
```json
{
  "aiCodingAssistant.aiMode": "hybrid",
  "aiCodingAssistant.preferredProvider": "ollama",
  "aiCodingAssistant.fallbackProvider": "groq"
}
```
*Use local models primarily, fall back to Groq's generous free tier*

### For Best Performance (Free)
```json
{
  "aiCodingAssistant.aiMode": "online",
  "aiCodingAssistant.preferredProvider": "groq",
  "aiCodingAssistant.fallbackProvider": "google"
}
```
*Ultra-fast responses with large context fallback*

### For Complex Reasoning
```json
{
  "aiCodingAssistant.aiMode": "online",
  "aiCodingAssistant.preferredProvider": "openai",
  "aiCodingAssistant.selectedModel": "gpt-4o"
}
```
*Best for complex code analysis and generation*

### For Large Codebases
```json
{
  "aiCodingAssistant.aiMode": "online",
  "aiCodingAssistant.preferredProvider": "google",
  "aiCodingAssistant.selectedModel": "gemini-1.5-pro"
}
```
*2M token context for analyzing entire files*

## 🔒 Security Best Practices

### API Key Storage
- ✅ **Use VS Code's secure storage** (built into the extension)
- ✅ **Never commit API keys** to version control
- ✅ **Use environment variables** for server deployment
- ❌ **Don't share API keys** in screenshots or logs

### Key Management
```bash
# Check if keys are properly stored
# In VS Code: Ctrl+Shift+P → "AI Coding Assistant: Open Settings"
# Verify green checkmarks next to configured providers
```

### Rotation Policy
- **Rotate keys monthly** for production use
- **Monitor usage** through provider dashboards
- **Set up billing alerts** to avoid unexpected charges

## 📊 Cost Optimization

### Free Tier Maximization
1. **Start with Groq** - highest free limits
2. **Use Google AI** for large context needs
3. **Keep local models** as primary (Ollama)
4. **Set up hybrid mode** for automatic fallback

### Paid Usage Optimization
1. **Use cheaper models** for simple tasks (GPT-3.5, Claude Haiku)
2. **Reserve premium models** for complex reasoning
3. **Monitor token usage** through provider dashboards
4. **Set spending limits** to avoid overages

### Cost Comparison (per 1M tokens)

| Provider | Model | Input | Output | Best For |
|----------|-------|-------|--------|----------|
| **Groq** | Llama 3.1 70B | $0.59 | $0.79 | Speed |
| **Google** | Gemini 1.5 Flash | $0.075 | $0.30 | Large context |
| **OpenAI** | GPT-4o | $5.00 | $15.00 | Quality |
| **Anthropic** | Claude 3.5 Sonnet | $3.00 | $15.00 | Reasoning |
| **Together** | Llama 3 70B | $0.90 | $0.90 | Open source |

## 🚨 Troubleshooting API Keys

### Common Issues

#### Invalid API Key
```bash
# Test your key directly
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.openai.com/v1/models
```

#### Rate Limits Exceeded
- **Switch providers** temporarily
- **Use hybrid mode** for automatic fallback
- **Upgrade to paid tier** for higher limits

#### Billing Issues
- **Check payment method** in provider dashboard
- **Set up billing alerts**
- **Monitor usage regularly**

### Testing Configuration

Use the built-in test feature:
1. Open AI Assistant Settings (`Ctrl+Shift+,`)
2. Click "Test" button next to each provider
3. Verify green checkmarks for working providers

## 🎯 Quick Start Recommendations

### New Users (Free)
1. **Start with Groq** - easiest setup, generous limits
2. **Add Google AI** - for large context needs
3. **Keep Ollama running** - for privacy-sensitive code

### Power Users (Paid)
1. **OpenAI GPT-4o** - for best quality
2. **Groq** - for speed
3. **Google Gemini Pro** - for large files
4. **Anthropic Claude** - for complex reasoning

### Enterprise Users
1. **Set up all providers** - for redundancy
2. **Use hybrid mode** - cost optimization
3. **Monitor usage** - with dashboards
4. **Implement key rotation** - security

---

**🔑 Remember**: API keys are like passwords - keep them secure and never share them publicly!
