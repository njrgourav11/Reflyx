# 🔧 Troubleshooting Guide - AI Coding Assistant

This comprehensive guide helps you diagnose and fix common issues with your AI coding assistant.

## 🚨 Quick Diagnostics

### Health Check Commands

```bash
# Check all services
make health

# Or manually:
curl http://localhost:8000/api/v1/health
curl http://localhost:6333/health
curl http://localhost:11434/api/tags
```

### VS Code Extension Status

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "AI Coding Assistant: Open Settings"
3. Check for green checkmarks next to providers
4. Look for validation issues at the top

## 🔍 Common Issues & Solutions

### 1. "Server unavailable" Error

**Symptoms:**
- Red error icon in status bar
- "Server unavailable" message
- Extension commands not working

**Diagnosis:**
```bash
# Check if backend is running
curl http://localhost:8000/api/v1/health

# Check Docker containers
docker-compose ps

# Expected output:
# ai-assistant-backend    Up (healthy)
# ai-assistant-qdrant     Up (healthy)
# ai-assistant-redis      Up (healthy)
```

**Solutions:**

#### Option 1: Restart Services
```bash
# Restart all services
docker-compose restart

# Or stop and start fresh
docker-compose down
docker-compose up -d
```

#### Option 2: Check Logs
```bash
# View backend logs
docker-compose logs -f backend

# Common issues in logs:
# - Port already in use
# - Database connection failed
# - Missing environment variables
```

#### Option 3: Port Conflicts
```bash
# Check if port 8000 is in use
netstat -an | grep 8000

# If port is busy, change in docker-compose.yml:
# ports:
#   - "8001:8000"  # Use port 8001 instead
```

### 2. "Ollama connection failed"

**Symptoms:**
- Local mode not working
- "Provider not available" for Ollama
- Models not loading

**Diagnosis:**
```bash
# Check if Ollama is running
ollama list

# Test Ollama API
curl http://localhost:11434/api/tags
```

**Solutions:**

#### Option 1: Start Ollama Service
```bash
# Start Ollama (varies by OS)
# Windows: Start Ollama from Start Menu
# macOS: Start Ollama app
# Linux: systemctl start ollama

# Or run manually:
ollama serve
```

#### Option 2: Install/Pull Models
```bash
# Pull required models
ollama pull codellama:7b-code
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:7b

# Verify installation
ollama list
```

#### Option 3: Check Ollama Configuration
```bash
# Check Ollama logs
# Windows: Check Event Viewer
# macOS/Linux: journalctl -u ollama

# Common issues:
# - Insufficient disk space
# - GPU driver issues
# - Model download interrupted
```

### 3. VS Code Extension Not Loading

**Symptoms:**
- Extension not appearing in sidebar
- Commands not available
- No status bar item

**Diagnosis:**
1. Open VS Code Developer Console: `Help` → `Toggle Developer Tools`
2. Check Console tab for errors
3. Look for extension-related error messages

**Solutions:**

#### Option 1: Reload Extension
```bash
# In VS Code:
# Ctrl+Shift+P → "Developer: Reload Window"
```

#### Option 2: Reinstall Extension
```bash
# Remove and reinstall .vsix file
# Or rebuild from source:
cd extension
npm install
npm run compile
npm run package
```

#### Option 3: Check Extension Logs
```bash
# In VS Code:
# Ctrl+Shift+P → "Developer: Show Running Extensions"
# Look for AI Coding Assistant and check for errors
```

### 4. API Key Issues

**Symptoms:**
- "API key required" errors
- Online providers not working
- Authentication failures

**Diagnosis:**
1. Open AI Assistant Settings (`Ctrl+Shift+,`)
2. Check API key status for each provider
3. Click "Test" button to verify keys

**Solutions:**

#### Option 1: Re-enter API Keys
```bash
# In VS Code Settings:
# 1. Remove existing API key
# 2. Enter new API key
# 3. Click "Save"
# 4. Click "Test" to verify
```

#### Option 2: Verify API Key Format
```bash
# OpenAI: starts with "sk-"
# Anthropic: starts with "sk-ant-"
# Google: alphanumeric string
# Groq: starts with "gsk_"
```

#### Option 3: Test API Keys Manually
```bash
# Test OpenAI key
curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.openai.com/v1/models

# Test Anthropic key
curl -H "x-api-key: YOUR_KEY" \
     -H "Content-Type: application/json" \
     https://api.anthropic.com/v1/messages

# Test Google AI key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

### 5. Indexing Problems

**Symptoms:**
- "No results found" when querying
- Indexing never completes
- High memory usage during indexing

**Diagnosis:**
```bash
# Check indexing status
curl http://localhost:8000/api/v1/stats

# Check Qdrant status
curl http://localhost:6333/collections
```

**Solutions:**

#### Option 1: Re-index Workspace
```bash
# In VS Code:
# Ctrl+Shift+P → "AI Coding Assistant: Index Workspace"
# Wait for completion (check status bar)
```

#### Option 2: Adjust Indexing Settings
```json
// In VS Code settings.json:
{
  "aiCodingAssistant.maxChunkSize": 300,  // Reduce from 500
  "aiCodingAssistant.ignorePatterns": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    "*.min.js",
    "*.map"
  ]
}
```

#### Option 3: Clear and Rebuild Index
```bash
# Stop services
docker-compose down

# Remove Qdrant data
docker volume rm ai-assistant_qdrant_data

# Restart and re-index
docker-compose up -d
```

### 6. Performance Issues

**Symptoms:**
- Slow responses
- High CPU/memory usage
- Timeouts

**Diagnosis:**
```bash
# Check system resources
docker stats

# Check response times
curl -w "@curl-format.txt" http://localhost:8000/api/v1/health
```

**Solutions:**

#### Option 1: Optimize Settings
```json
{
  "aiCodingAssistant.retrievalCount": 5,      // Reduce from 10
  "aiCodingAssistant.similarityThreshold": 0.8, // Increase from 0.7
  "aiCodingAssistant.maxChunkSize": 300       // Reduce from 500
}
```

#### Option 2: Switch to Faster Provider
```json
{
  "aiCodingAssistant.preferredProvider": "groq",  // Ultra-fast
  "aiCodingAssistant.aiMode": "online"
}
```

#### Option 3: Use Hybrid Mode
```json
{
  "aiCodingAssistant.aiMode": "hybrid",
  "aiCodingAssistant.preferredProvider": "ollama",
  "aiCodingAssistant.fallbackProvider": "groq"
}
```

## 🔧 Advanced Troubleshooting

### Docker Issues

#### Container Won't Start
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :8000
netstat -tulpn | grep :6333

# Check disk space
df -h

# Check Docker logs
docker-compose logs backend
docker-compose logs qdrant
```

#### Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 8GB+

# Or use lighter configuration
export EMBEDDING_MODEL=paraphrase-MiniLM-L3-v2  # Smaller model
```

### Network Issues

#### Firewall/Proxy Problems
```bash
# Check if ports are accessible
telnet localhost 8000
telnet localhost 6333
telnet localhost 11434

# For corporate networks, configure proxy:
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

#### DNS Issues
```bash
# Use IP addresses instead of hostnames
QDRANT_URL=http://127.0.0.1:6333
OLLAMA_URL=http://127.0.0.1:11434
```

### Model Issues

#### Model Download Failures
```bash
# Check disk space
df -h

# Manually download models
ollama pull codellama:7b-code --verbose

# Check Ollama logs
ollama logs
```

#### GPU Issues
```bash
# Check GPU availability
nvidia-smi  # For NVIDIA GPUs

# Disable GPU if causing issues
export CUDA_VISIBLE_DEVICES=""
```

## 📊 Monitoring & Logs

### Log Locations

#### Backend Logs
```bash
# Docker logs
docker-compose logs -f backend

# File logs (if configured)
tail -f server/logs/ai_assistant.log
```

#### VS Code Extension Logs
```bash
# Open VS Code Developer Console
# Help → Toggle Developer Tools → Console

# Or check Output panel
# View → Output → Select "AI Coding Assistant"
```

#### Ollama Logs
```bash
# Windows: Event Viewer → Applications
# macOS: Console app → Search "ollama"
# Linux: journalctl -u ollama -f
```

### Performance Monitoring

#### System Resources
```bash
# Monitor Docker containers
docker stats

# Monitor system resources
htop  # Linux/macOS
# Task Manager (Windows)
```

#### API Response Times
```bash
# Create curl-format.txt:
echo "     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n" > curl-format.txt

# Test API response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/v1/health
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Run health checks** (`make health`)
3. **Collect logs** from all services
4. **Note your configuration** (OS, Docker version, etc.)
5. **Try minimal reproduction** (fresh install, simple query)

### Information to Include

When reporting issues, include:

```bash
# System information
uname -a                    # OS version
docker --version           # Docker version
docker-compose --version   # Docker Compose version
node --version             # Node.js version
python --version           # Python version

# Service status
docker-compose ps          # Container status
curl http://localhost:8000/api/v1/health  # Backend health

# Configuration
cat server/.env            # Backend config (remove API keys!)
# VS Code settings (aiCodingAssistant.*)

# Logs (last 50 lines)
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 qdrant
```

### Support Channels

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-repo/issues)
- **Discussions**: [Community help and questions](https://github.com/your-repo/discussions)
- **Discord**: [Real-time chat support](https://discord.gg/your-invite)
- **Documentation**: [Full documentation](../README.md)

### Emergency Recovery

If everything is broken:

```bash
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a
rm -rf server/cache
rm -rf server/logs

# Fresh start
python setup.py
docker-compose up -d
```

---

**💡 Pro Tip**: Most issues are resolved by restarting services or checking API keys. Start with the simple solutions first!
