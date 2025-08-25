# 🚀 AI Coding Assistant - Complete Installation & Setup Guide

This comprehensive guide will walk you through installing and configuring your AI coding assistant to match the functionality of Augment Code, with both local and online AI capabilities.

## 📋 Prerequisites

Before starting, ensure you have these installed:

### Required Software
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Python** (3.8+) - [Download](https://python.org/)
- **Docker** & Docker Compose - [Download](https://docker.com/)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Git** - [Download](https://git-scm.com/)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **CPU**: 4+ cores recommended for local AI models
- **Internet**: Required for initial setup and online AI modes

## 🎯 Installation Methods

Choose your preferred installation method:

### Method 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-repo/ai-coding-assistant.git
cd ai-coding-assistant

# Run automated setup
python setup.py

# Start services
docker-compose up -d

# Verify installation
make health
```

### Method 2: Manual Setup

Follow the detailed steps below for complete control over the installation process.

## 🔧 Step-by-Step Manual Installation

### Step 1: Clone and Setup Backend

```bash
# Clone repository
git clone https://github.com/your-repo/ai-coding-assistant.git
cd ai-coding-assistant

# Setup Python environment
cd server
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp ../.env.example .env
```

### Step 2: Configure Environment

Edit `server/.env` with your preferences:

```bash
# Basic Configuration
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://localhost:11434
REDIS_URL=redis://localhost:6379

# AI Processing Mode
AI_MODE=local  # Options: local, online, hybrid
PREFERRED_PROVIDER=ollama
FALLBACK_PROVIDER=

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Optional: Cloud API Keys (see API Keys section below)
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
# GOOGLE_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
```

### Step 3: Start Backend Services

```bash
# Start all services with Docker
docker-compose up -d

# Check service status
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

Expected output:
```
NAME                    STATUS
ai-assistant-qdrant     Up (healthy)
ai-assistant-backend    Up (healthy)
ai-assistant-redis      Up (healthy)
```

### Step 4: Install Local AI Models (Ollama)

```bash
# Install Ollama (visit https://ollama.ai for your OS)

# Pull recommended coding models
ollama pull codellama:7b-code
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:7b

# Verify installation
ollama list
```

### Step 5: Build VS Code Extension

```bash
# Navigate to extension directory
cd extension

# Install Node.js dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package
```

This creates a `.vsix` file in the extension directory.

### Step 6: Install VS Code Extension

#### Option A: Install from .vsix file

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Install from VSIX"
4. Select the generated `.vsix` file
5. Restart VS Code

#### Option B: Development Mode

1. Open VS Code in the extension directory
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new VS Code window

## 🔑 API Keys Configuration

To use online AI providers, you'll need API keys. Here's how to get them:

### OpenAI (GPT-4o, GPT-4 Turbo)

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Free Credits**: $5 for new accounts

### Anthropic (Claude 3.5 Sonnet)

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. **Free Credits**: Available for new accounts

### Google AI (Gemini 1.5 Pro)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. **Free Tier**: Generous limits available

### Groq (Ultra-fast inference)

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. **Free Tier**: 14,400 requests per day

### Together AI (Open-source models)

1. Visit [Together AI](https://api.together.xyz/settings/api-keys)
2. Sign up or log in
3. Click "Create new API key"
4. Copy the key
5. **Free Credits**: Available for new accounts

## ⚙️ VS Code Extension Configuration

### Initial Setup

1. Open VS Code
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run "AI Coding Assistant: Open Settings"
4. Configure your preferences:

#### Basic Configuration
- **AI Mode**: Choose Local, Online, or Hybrid
- **Preferred Provider**: Select your primary AI provider
- **Fallback Provider**: Optional backup provider

#### API Keys (for Online/Hybrid modes)
- Enter API keys securely through the settings panel
- Keys are stored using VS Code's secure storage
- Test each provider after entering keys

### Quick Configuration Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Open Settings | `Ctrl+Shift+,` | Open configuration panel |
| Switch AI Mode | `Ctrl+Shift+M` | Quick mode switching |
| Select Provider | - | Choose AI provider |
| Ask Codebase | `Ctrl+Shift+A` | Query your code |
| Toggle Chat | `Ctrl+Shift+C` | Show/hide chat panel |

## 🧪 Testing Your Installation

### 1. Backend Health Check

```bash
# Check all services
curl http://localhost:8000/api/v1/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "services": {
    "qdrant": {"status": "healthy"},
    "redis": {"status": "healthy"}
  }
}
```

### 2. Test Local AI (Ollama)

```bash
# Test Ollama directly
curl http://localhost:11434/api/tags

# Should return list of installed models
```

### 3. Test VS Code Extension

1. Open a code project in VS Code
2. Run "AI Coding Assistant: Index Workspace"
3. Wait for indexing to complete
4. Try asking: "Where is the main function?"
5. Test code explanation by selecting code and pressing `Ctrl+Shift+E`

### 4. Test Online Providers (if configured)

1. Switch to Online mode: `Ctrl+Shift+M`
2. Select an online provider
3. Ask a complex question to test the connection
4. Verify responses are coming from the cloud provider

## 🔧 Advanced Configuration

### Performance Tuning

Edit VS Code settings (`Ctrl+,`):

```json
{
  "aiCodingAssistant.maxChunkSize": 500,
  "aiCodingAssistant.retrievalCount": 10,
  "aiCodingAssistant.similarityThreshold": 0.7,
  "aiCodingAssistant.ignorePatterns": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**"
  ]
}
```

### Custom Model Configuration

For advanced users, you can configure specific models:

```json
{
  "aiCodingAssistant.selectedModel": "gpt-4o",
  "aiCodingAssistant.fallbackProvider": "groq"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Server unavailable" error

```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose restart

# Check logs
docker-compose logs -f backend
```

#### 2. "Ollama connection failed"

```bash
# Check Ollama status
ollama list

# Start Ollama service (if not running)
ollama serve

# Pull required models
ollama pull codellama:7b-code
```

#### 3. Extension not loading

- Check VS Code Developer Console: `Help` → `Toggle Developer Tools`
- Look for error messages in the Console tab
- Try reloading VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

#### 4. API key errors

- Verify API keys are entered correctly
- Check API key permissions and quotas
- Test API keys directly with curl:

```bash
# Test OpenAI
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.openai.com/v1/models

# Test Anthropic
curl -H "x-api-key: YOUR_API_KEY" \
     https://api.anthropic.com/v1/messages
```

#### 5. Indexing issues

```bash
# Check indexing status
curl http://localhost:8000/api/v1/stats

# Re-index workspace
# In VS Code: Ctrl+Shift+P → "AI Coding Assistant: Index Workspace"
```

### Performance Issues

#### Slow responses
- Switch to a faster provider (Groq for speed)
- Reduce `retrievalCount` in settings
- Use smaller models for simple tasks

#### High memory usage
- Reduce `maxChunkSize` in settings
- Close other applications
- Use online mode to reduce local resource usage

#### Slow indexing
- Add more patterns to `ignorePatterns`
- Index smaller projects first
- Use SSD storage for better performance

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Check system health
make health

# View detailed statistics
curl http://localhost:8000/api/v1/stats | jq

# Monitor logs
docker-compose logs -f --tail=100
```

### Regular Maintenance

```bash
# Update models
ollama pull codellama:7b-code

# Clean up Docker
docker system prune

# Update extension
cd extension && npm run package
```

## 🎉 You're Ready!

Congratulations! Your AI coding assistant is now installed and configured. Here's what you can do next:

### Immediate Next Steps
1. **Index your first project**: Open a codebase and run indexing
2. **Try different AI modes**: Switch between local and online
3. **Explore features**: Use code explanation, generation, and search
4. **Customize settings**: Adjust to your preferences

### Advanced Usage
- Set up multiple API keys for different providers
- Configure custom ignore patterns for your projects
- Experiment with different models for different tasks
- Use hybrid mode for the best of both worlds

### Getting Help
- Check the [Architecture Guide](ARCHITECTURE.md) for technical details
- Visit [GitHub Issues](https://github.com/your-repo/issues) for support
- Join our [Discord Community](https://discord.gg/your-invite) for discussions

**Happy coding with AI assistance! 🚀**
