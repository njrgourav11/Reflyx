# 🤖 AI Coding Assistant - Enhanced with Dual-Mode AI Processing

A comprehensive, production-ready AI coding assistant that **matches and exceeds** the functionality of Augment Code, Cursor, and Windsurf. Features **dual-mode operation** with seamless switching between local privacy and cloud-powered performance, advanced semantic search, intelligent code generation, and contextual explanations.

## 🌟 **NEW: Augment Code-Level Features**

- **🔄 Dual-Mode AI Processing**: Seamlessly switch between local (Ollama) and online (GPT-4o, Claude-3.5-Sonnet, Gemini Pro) AI models
- **🔐 Secure API Key Management**: Built-in secure storage using VS Code's SecretStorage API
- **⚡ Ultra-Fast Inference**: Groq integration with 500+ tokens/second processing
- **🎯 Smart Provider Selection**: Automatic fallback and intelligent routing
- **📱 Enhanced UI**: Context-aware chat, inline suggestions, and real-time streaming
- **🔧 Advanced Configuration**: Comprehensive settings panel with provider management

## 🚀 Core Features

### 🤖 **Dual-Mode AI Processing**
- **Local Mode**: Complete privacy with Ollama (CodeLlama, DeepSeek-Coder, Qwen2.5-Coder)
- **Online Mode**: Access to latest models (GPT-4o, Claude-3.5-Sonnet, Gemini Pro, Groq)
- **Hybrid Mode**: Intelligent routing between local and cloud for optimal performance
- **Smart Fallback**: Automatic provider switching if primary fails

### 🔍 **Advanced Code Intelligence**
- **Semantic Code Search**: Query your entire codebase using natural language
- **Context-Aware Explanations**: Detailed code explanations with surrounding context
- **Intelligent Code Generation**: Generate production-ready code from prompts
- **Smart Refactoring**: AI-powered refactoring suggestions with examples
- **Pattern Detection**: Find similar code patterns and potential duplications
- **Real-time Indexing**: Automatic re-indexing when files change

### 🎯 **Enhanced User Experience**
- **Inline Code Suggestions**: Real-time AI suggestions as you type
- **Streaming Responses**: See AI responses as they're generated
- **Context-Aware Chat**: Persistent chat with full codebase context
- **Quick Actions**: Right-click context menu for instant AI help
- **Status Indicators**: Real-time status of AI providers and indexing progress

## 🤖 **Supported AI Providers**

### 🏠 **Local Providers (Free & Private)**
| Provider | Models | Context | Speed | Privacy |
|----------|--------|---------|-------|---------|
| **Ollama** | CodeLlama 7B/13B/34B<br>DeepSeek-Coder 6.7B<br>Qwen2.5-Coder 7B | 16K-32K | Hardware-dependent | 🟢 Complete |

### ☁️ **Online Providers (Cloud APIs)**
| Provider | Models | Context | Speed | Free Tier |
|----------|--------|---------|-------|-----------|
| **OpenAI** | GPT-4o, GPT-4 Turbo | 128K | Fast | $5 credit |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | 200K | Fast | Limited |
| **Google AI** | Gemini 1.5 Pro, Gemini 1.5 Flash | 2M | Medium | Generous |
| **Groq** | Llama 3.1 70B, Mixtral 8x7B | 131K | **Ultra-fast** | 14.4K req/day |
| **Together AI** | Llama 3 70B, CodeLlama 34B | 8K-16K | Fast | $25 credit |

### 🎯 **Quick Setup Recommendations**
- **Privacy-First**: Use Local mode with Ollama
- **Speed-First**: Use Groq (500+ tokens/second, generous free tier)
- **Quality-First**: Use GPT-4o or Claude 3.5 Sonnet
- **Budget-First**: Use Hybrid mode (local + Groq fallback)
- **Enterprise**: Use Local mode with larger models (13B/34B)

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VS Code       │    │   FastAPI        │    │   Qdrant        │
│   Extension     │◄──►│   Backend        │◄──►│   Vector DB     │
│   (TypeScript)  │    │   (Python)       │    │   (Self-hosted) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌────────▼────────┐
                       │   Ollama        │
                       │   Local LLMs    │
                       │   (Free Models) │
                       └─────────────────┘
```

## 🛠️ Tech Stack (100% Free & Open Source)

### Core Components
- **Frontend**: VS Code Extension (TypeScript)
- **Backend**: Python FastAPI
- **Database**: Qdrant Vector Database (self-hosted)
- **AI Models**: Ollama (CodeLlama, DeepSeek-Coder, Qwen2.5-Coder)
- **Code Parsing**: Tree-sitter
- **Embeddings**: Sentence-Transformers (all-MiniLM-L6-v2)

### Free Cloud Alternatives (Optional)
- **Vector DB**: Pinecone (free tier), Weaviate Cloud
- **LLM APIs**: Groq (free tier), Together AI, Google Gemini Pro
- **Hosting**: Railway, Render, Fly.io (all have free tiers)

## 📋 Prerequisites

### Minimum Requirements
- **RAM**: 8GB (16GB recommended)
- **CPU**: 4-core (8-core recommended)
- **Storage**: 5GB free space (10GB recommended)
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Required Software
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://python.org/) (3.8+)
- [Docker](https://docker.com/) & Docker Compose
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

## 🚀 Quick Start (3 Steps)

### 1. **Automated Setup**
```bash
# Clone and setup everything automatically
git clone https://github.com/njrgourav11/Reflyx.git
cd Reflyx
python setup.py  # Installs everything: Docker, models, dependencies

# Start all services
docker-compose up -d
```

### 2. **Install VS Code Extension**
```bash
# Build and package the extension
cd extension
npm install && npm run compile && npm run package

# Install the .vsix file in VS Code:
# 1. Open VS Code
# 2. Ctrl+Shift+P → "Extensions: Install from VSIX"
# 3. Select the generated .vsix file
# 4. Restart VS Code
```

### 3. **Configure AI Providers**
```bash
# Option A: Local Only (Complete Privacy)
# 1. Install Ollama: https://ollama.ai
# 2. Pull models: ollama pull codellama:7b-code
# 3. In VS Code: Ctrl+Shift+, → Set mode to "Local"

# Option B: Online + Local (Best Performance)
# 1. Get free API keys (see API Keys Guide)
# 2. In VS Code: Ctrl+Shift+, → Configure providers
# 3. Set mode to "Hybrid" for best of both worlds
```

## 🎯 **First Steps After Installation**

### **Immediate Setup (2 minutes)**
1. **Open VS Code** in your project directory
2. **Index your codebase**: `Ctrl+Shift+P` → "AI Coding Assistant: Index Workspace"
3. **Open settings**: `Ctrl+Shift+,` to configure AI providers
4. **Start chatting**: `Ctrl+Shift+C` to open the AI chat panel

### **Test Your Installation**
```bash
# Quick health check
make health

# Or manually test each service:
curl http://localhost:8000/api/v1/health  # Backend
curl http://localhost:6333/health         # Vector DB
curl http://localhost:11434/api/tags      # Ollama (if using local)
```

### **Try These Example Queries**
- "Where is user authentication handled in this codebase?"
- "Show me all database connection functions"
- "Find error handling patterns"
- Select code → Right-click → "Explain Selection"
- `Ctrl+Shift+G` → "Create a REST API endpoint for user login"

# Or start individually:
# Backend server
cd server && python -m uvicorn app.main:app --reload

# Qdrant vector database
docker run -p 6333:6333 qdrant/qdrant

# Ollama (install from https://ollama.ai)
ollama pull codellama:7b-code
```

### 3. Install VS Code Extension
```bash
cd extension
npm install
npm run compile
# Install the .vsix package in VS Code
```

### 4. Configure Workspace
1. Open VS Code in your project directory
2. Run command: `AI Coding Assistant: Index Workspace`
3. Start chatting with your codebase!

## 📖 Usage Guide

### Basic Commands
- **Ctrl+Shift+P** → `AI Coding Assistant: Ask Codebase`
- **Ctrl+Shift+P** → `AI Coding Assistant: Explain Selection`
- **Ctrl+Shift+P** → `AI Coding Assistant: Generate Code`
- **Ctrl+Shift+P** → `AI Coding Assistant: Find Similar`

### Chat Interface
- Open the AI Assistant sidebar panel
- Type natural language queries about your code
- Get contextual responses with code references

### Example Queries
```
"Where is user authentication handled?"
"Explain this function and its dependencies"
"Generate a REST API endpoint for user login"
"Find all database connection functions"
"Suggest refactoring for this class"
```

## ⚙️ Configuration

### VS Code Settings
```json
{
  "aiCodingAssistant.modelProvider": "ollama",
  "aiCodingAssistant.embeddingModel": "all-MiniLM-L6-v2",
  "aiCodingAssistant.maxChunkSize": 500,
  "aiCodingAssistant.retrievalCount": 10,
  "aiCodingAssistant.ignorePatterns": [
    "node_modules/**",
    ".git/**",
    "*.min.js",
    "dist/**"
  ]
}
```

### Environment Variables
```bash
# Backend Configuration
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Optional Cloud APIs (Free Tiers)
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

## 🧪 Supported Languages

- **Primary**: TypeScript, JavaScript, Python, Java
- **Additional**: C++, Rust, Go, C#, PHP, Ruby
- **Extensible**: Easy to add new languages via Tree-sitter grammars

## 📊 Performance Metrics

### Indexing Performance
- **Speed**: ~1000 files/minute (4-core CPU)
- **Memory**: <2GB during indexing
- **Storage**: ~100MB per 10K files

### Query Performance
- **Simple Queries**: <3 seconds
- **Code Generation**: <8 seconds
- **Context Window**: Up to 32K tokens

## 🔧 Development

### Project Structure
```
ai-coding-assistant/
├── extension/          # VS Code extension (TypeScript)
├── server/            # FastAPI backend (Python)
├── indexer/           # Code parsing & embedding
├── docker-compose.yml # Local development setup
└── docs/             # Documentation
```

### Running in Development Mode
```bash
# Backend with hot reload
cd server && python -m uvicorn app.main:app --reload

# Extension development
cd extension && npm run watch

# Vector database
docker run -p 6333:6333 qdrant/qdrant
```

## 🐛 Troubleshooting

### Common Issues

**1. Ollama Connection Failed**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull required models
ollama pull codellama:7b-code
```

**2. Qdrant Connection Error**
```bash
# Check Qdrant status
curl http://localhost:6333/health

# Restart Qdrant
docker restart qdrant
```

**3. Extension Not Loading**
- Check VS Code Developer Console (Help → Toggle Developer Tools)
- Verify extension is installed and enabled
- Restart VS Code

### Performance Optimization
- **Low RAM**: Use smaller embedding models (all-MiniLM-L3-v2)
- **Slow Indexing**: Reduce chunk size and increase ignore patterns
- **High CPU**: Limit concurrent indexing threads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local LLM hosting
- [Qdrant](https://qdrant.tech/) for vector database
- [Tree-sitter](https://tree-sitter.github.io/) for code parsing
- [Sentence Transformers](https://www.sbert.net/) for embeddings
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework

## 📚 **Comprehensive Documentation**

### 🚀 **Getting Started**
- **[📋 Installation Guide](docs/INSTALLATION_GUIDE.md)** - Complete step-by-step setup with screenshots
- **[🔑 API Keys Guide](docs/API_KEYS_GUIDE.md)** - How to get free API keys from all providers
- **[⚡ Quick Start](docs/QUICK_START.md)** - Get running in under 10 minutes
- **[🔧 Troubleshooting](docs/TROUBLESHOOTING.md)** - Solutions for common issues

### 🏗️ **Technical Documentation**
- **[🏛️ Architecture Overview](docs/ARCHITECTURE.md)** - System design and components
- **[📊 Performance Comparison](docs/PERFORMANCE_COMPARISON.md)** - Local vs Online benchmarks
- **[🔧 Configuration Guide](docs/CONFIGURATION.md)** - Advanced settings and tuning
- **[🧪 Testing Guide](docs/TESTING.md)** - How to test your installation

### 🎯 **User Guides**
- **[💡 Best Practices](docs/BEST_PRACTICES.md)** - Tips for optimal usage
- **[🔒 Security Guide](docs/SECURITY.md)** - Privacy and security considerations
- **[💰 Cost Optimization](docs/COST_OPTIMIZATION.md)** - Minimize API costs
- **[🚀 Advanced Features](docs/ADVANCED_FEATURES.md)** - Power user features

## 🎮 **VS Code Commands & Shortcuts**

| Command | Shortcut | Description |
|---------|----------|-------------|
| **Ask Codebase** | `Ctrl+Shift+A` | Query your entire codebase |
| **Explain Selection** | `Ctrl+Shift+E` | Explain selected code |
| **Generate Code** | `Ctrl+Shift+G` | Generate code from description |
| **Toggle Chat** | `Ctrl+Shift+C` | Show/hide AI chat panel |
| **Open Settings** | `Ctrl+Shift+,` | Configure AI providers |
| **Switch AI Mode** | `Ctrl+Shift+M` | Quick mode switching |
| **Index Workspace** | - | Re-index your codebase |
| **Find Similar** | - | Find similar code patterns |

## 🔧 **Advanced Configuration Examples**

### **Privacy-First Setup (Local Only)**
```json
{
  "aiCodingAssistant.aiMode": "local",
  "aiCodingAssistant.preferredProvider": "ollama",
  "aiCodingAssistant.selectedModel": "codellama:7b-code"
}
```

### **Performance-First Setup (Cloud)**
```json
{
  "aiCodingAssistant.aiMode": "online",
  "aiCodingAssistant.preferredProvider": "groq",
  "aiCodingAssistant.selectedModel": "llama-3.1-70b-versatile",
  "aiCodingAssistant.fallbackProvider": "google"
}
```

### **Balanced Setup (Hybrid)**
```json
{
  "aiCodingAssistant.aiMode": "hybrid",
  "aiCodingAssistant.preferredProvider": "ollama",
  "aiCodingAssistant.fallbackProvider": "groq",
  "aiCodingAssistant.maxChunkSize": 400,
  "aiCodingAssistant.retrievalCount": 8
}
```

## 📊 **Feature Comparison**

| Feature | This Project | Cursor | Windsurf | Augment Code |
|---------|-------------|--------|----------|--------------|
| **Local AI Processing** | ✅ | ❌ | ❌ | ✅ |
| **Multiple AI Providers** | ✅ | ✅ | ✅ | ✅ |
| **Semantic Code Search** | ✅ | ✅ | ✅ | ✅ |
| **Real-time Streaming** | ✅ | ✅ | ✅ | ✅ |
| **API Key Security** | ✅ | ✅ | ✅ | ✅ |
| **Offline Capability** | ✅ | ❌ | ❌ | ✅ |
| **Free Tier** | ✅ | ❌ | ❌ | ❌ |
| **Open Source** | ✅ | ❌ | ❌ | ❌ |
| **Self-Hosted** | ✅ | ❌ | ❌ | ✅ |
| **Enterprise Ready** | ✅ | ✅ | ✅ | ✅ |

## 📞 **Support & Community**

### 🆘 **Getting Help**
- **[🔧 Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Fix common issues
- **[🐛 GitHub Issues](https://github.com/njrgourav11/Reflyx/issues)** - Report bugs
- **[💬 GitHub Discussions](https://github.com/njrgourav11/Reflyx/discussions)** - Ask questions
- **[📖 Full Documentation](docs/)** - Complete guides

### 🤝 **Community**
- **[Discord Server](https://discord.gg/your-invite)** - Real-time chat
- **[Reddit Community](https://reddit.com/r/your-community)** - Share experiences
- **[YouTube Channel](https://youtube.com/your-channel)** - Video tutorials
- **[Blog](https://blog.your-site.com)** - Latest updates and tips

### 🚀 **Contributing**
We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

1. **🐛 Report Issues** - Help us improve by reporting bugs
2. **💡 Suggest Features** - Share your ideas for new features
3. **📝 Improve Docs** - Help make our documentation better
4. **🔧 Submit Code** - Contribute bug fixes and features
5. **🌟 Star the Repo** - Show your support!

---

## 🎉 **Ready to Get Started?**

### **Choose Your Path:**

🏠 **Privacy-First Developer**
```bash
# Complete local setup
python setup.py --local-only
# Configure Ollama models only
```

☁️ **Performance-First Developer**
```bash
# Setup with cloud providers
python setup.py --with-cloud
# Get API keys from our guide
```

🔄 **Best-of-Both Developer**
```bash
# Full hybrid setup
python setup.py --hybrid
# Configure both local and cloud
```

### **Next Steps:**
1. **[📋 Follow Installation Guide](docs/INSTALLATION_GUIDE.md)**
2. **[🔑 Get Your API Keys](docs/API_KEYS_GUIDE.md)**
3. **[⚡ Complete Quick Start](docs/QUICK_START.md)**
4. **[🎮 Learn the Commands](#-vs-code-commands--shortcuts)**
5. **[🚀 Explore Advanced Features](docs/ADVANCED_FEATURES.md)**

---

**🤖 Built with ❤️ to democratize AI-powered coding assistance**

*"Making advanced AI coding tools accessible to every developer, everywhere, for free."*

### Support Me
<!-- Button version -->
<a href="https://www.buymeacoffee.com/njrgourav11" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="45" width="180">
</a>
