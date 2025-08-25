# AI Coding Assistant - Quick Start Guide

Get up and running with your local AI coding assistant in under 10 minutes!

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16+) - [Download here](https://nodejs.org/)
- **Python** (3.8+) - [Download here](https://python.org/)
- **Docker** & Docker Compose - [Download here](https://docker.com/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

## 📦 Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai-coding-assistant

# Run the automated setup
python setup.py
```

The setup script will:
- ✅ Check all prerequisites
- ✅ Set up Python virtual environment
- ✅ Install Node.js dependencies
- ✅ Configure Docker services
- ✅ Download AI models (optional)
- ✅ Create configuration files

### 2. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

Expected output:
```
NAME                    STATUS
ai-assistant-qdrant     Up (healthy)
ai-assistant-backend    Up (healthy)
ai-assistant-redis      Up (healthy)
```

### 3. Install Ollama (Local AI Models)

```bash
# Install Ollama (visit https://ollama.ai for your OS)
# Then pull the coding model:
ollama pull codellama:7b-code

# Verify installation
ollama list
```

### 4. Install VS Code Extension

```bash
cd extension
npm install
npm run compile

# Package the extension
npm run package

# Install the .vsix file in VS Code
# Or press F5 to run in development mode
```

## 🎯 First Steps

### 1. Open Your Project

1. Open VS Code in your project directory
2. You should see "AI Assistant" in the Explorer sidebar
3. If not, run: `Ctrl+Shift+P` → "AI Coding Assistant: Toggle Chat"

### 2. Index Your Codebase

1. Run: `Ctrl+Shift+P` → "AI Coding Assistant: Index Workspace"
2. Wait for indexing to complete (progress shown in status bar)
3. You'll see a notification when indexing is done

### 3. Start Asking Questions!

Try these example queries:

**Basic Queries:**
- "Where is user authentication handled?"
- "Show me all database connection functions"
- "Find error handling patterns in this codebase"

**Code Explanation:**
1. Select any code snippet
2. Right-click → "Explain Selection"
3. Or use `Ctrl+Shift+E`

**Code Generation:**
1. Use `Ctrl+Shift+G`
2. Type: "Create a REST API endpoint for user login"
3. Specify the language when prompted

## 🔧 Configuration

### VS Code Settings

Open VS Code settings (`Ctrl+,`) and search for "AI Coding Assistant":

```json
{
  "aiCodingAssistant.serverUrl": "http://localhost:8000",
  "aiCodingAssistant.modelProvider": "ollama",
  "aiCodingAssistant.embeddingModel": "all-MiniLM-L6-v2",
  "aiCodingAssistant.maxChunkSize": 500,
  "aiCodingAssistant.retrievalCount": 10,
  "aiCodingAssistant.autoIndex": true
}
```

### Backend Configuration

Edit `server/.env`:

```bash
# Vector Database
QDRANT_URL=http://localhost:6333

# Local LLM
OLLAMA_URL=http://localhost:11434

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Optional: Cloud API Keys (Free Tiers)
# OPENAI_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
```

## 🎮 Key Features & Commands

### Commands (Ctrl+Shift+P)

| Command | Shortcut | Description |
|---------|----------|-------------|
| Ask Codebase | `Ctrl+Shift+A` | Query your entire codebase |
| Explain Selection | `Ctrl+Shift+E` | Explain selected code |
| Generate Code | `Ctrl+Shift+G` | Generate code from description |
| Find Similar | - | Find similar code patterns |
| Index Workspace | - | Re-index your codebase |
| Toggle Chat | `Ctrl+Shift+C` | Show/hide chat panel |

### Context Menu Actions

Right-click on selected code:
- **Explain Selection** - Get detailed explanation
- **Find Similar Code** - Find similar patterns
- **Refactor Suggestion** - Get refactoring ideas

## 🔍 Troubleshooting

### Common Issues

**1. "Server unavailable" error**
```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose restart

# Check logs
docker-compose logs -f backend
```

**2. "Ollama connection failed"**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# Pull required models
ollama pull codellama:7b-code
```

**3. "No results found" when querying**
```bash
# Re-index your workspace
# In VS Code: Ctrl+Shift+P → "AI Coding Assistant: Index Workspace"

# Check indexing status
curl http://localhost:8000/api/v1/stats
```

**4. Extension not loading**
- Check VS Code Developer Console: `Help` → `Toggle Developer Tools`
- Restart VS Code
- Reinstall the extension

### Performance Issues

**Slow indexing:**
- Reduce `maxChunkSize` in settings
- Add more patterns to `ignorePatterns`
- Close other applications to free up memory

**Slow queries:**
- Lower `retrievalCount` in settings
- Increase `similarityThreshold`
- Use more specific queries

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/v1/health

# Detailed health with services
curl -X POST http://localhost:8000/api/v1/health/detailed

# System statistics
curl http://localhost:8000/api/v1/stats
```

### Logs

```bash
# View all service logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Qdrant logs
docker-compose logs -f qdrant
```

## 🎯 Next Steps

1. **Explore Advanced Features:**
   - Try different explanation levels (basic/detailed/expert)
   - Experiment with code generation styles
   - Use language filters in queries

2. **Customize Your Setup:**
   - Add cloud API keys for fallback models
   - Adjust ignore patterns for your project
   - Configure custom keybindings

3. **Optimize Performance:**
   - Monitor system resources
   - Adjust chunk sizes based on your codebase
   - Fine-tune similarity thresholds

4. **Join the Community:**
   - Report issues on GitHub
   - Share your use cases
   - Contribute improvements

## 🆘 Getting Help

- **Documentation:** [Full docs](../README.md)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)

---

**🎉 You're all set! Start exploring your codebase with AI assistance!**
