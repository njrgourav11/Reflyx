# 📦 VS Code Marketplace Publishing Guide - AI Coding Assistant

This comprehensive guide covers the complete process of publishing the AI Coding Assistant extension to the Visual Studio Code Marketplace, from preparation to ongoing maintenance.

## 📋 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Extension Preparation](#extension-preparation)
3. [Package.json Optimization](#packagejson-optimization)
4. [Extension Packaging](#extension-packaging)
5. [Microsoft Partner Center Setup](#microsoft-partner-center-setup)
6. [Marketplace Submission](#marketplace-submission)
7. [Version Management](#version-management)
8. [Discovery Optimization](#discovery-optimization)
9. [Post-Publication Management](#post-publication-management)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites & Setup

### Required Tools
```bash
# Install VS Code Extension Manager (vsce)
npm install -g vsce

# Install TypeScript compiler (if not already installed)
npm install -g typescript

# Verify installations
vsce --version
tsc --version
node --version
npm --version
```

### Microsoft Account Setup
1. **Create Microsoft Account**: Visit [account.microsoft.com](https://account.microsoft.com)
2. **Enable Two-Factor Authentication**: Required for publisher account
3. **Verify Email**: Ensure primary email is verified

### Azure DevOps Setup
```bash
# Create Personal Access Token (PAT)
# 1. Go to https://dev.azure.com
# 2. Sign in with Microsoft account
# 3. User Settings → Personal Access Tokens
# 4. Create new token with "Marketplace (manage)" scope
# 5. Copy token (you won't see it again!)

# Login to vsce with PAT
vsce login <publisher-name>
# Enter your PAT when prompted
```

## 📝 Extension Preparation

### Code Quality Checklist
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Check TypeScript compilation
npm run compile

# Verify no errors
echo "Extension preparation complete!"
```

### File Structure Validation
```
extension/
├── src/                    # TypeScript source files
├── out/                    # Compiled JavaScript (generated)
├── node_modules/           # Dependencies (excluded from package)
├── images/                 # Extension icons and screenshots
├── CHANGELOG.md           # Version history
├── README.md              # Extension documentation
├── LICENSE                # License file
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
└── .vscodeignore          # Files to exclude from package
```

### .vscodeignore Configuration
```gitignore
# .vscodeignore - Files to exclude from extension package
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
**/node_modules/**
**/.DS_Store
**/Thumbs.db
**/*.log
.env
.env.*
coverage/**
**/*.test.js
**/*.spec.js
test/**
tests/**
**/.nyc_output/**
docs/**
scripts/**
*.vsix
.github/**
```

### README.md Optimization
```markdown
# AI Coding Assistant - Enhanced with Dual-Mode AI Processing

[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)

A comprehensive AI-powered coding assistant that matches and exceeds the functionality of Augment Code, Cursor, and Windsurf. Features **dual-mode operation** with seamless switching between local privacy and cloud-powered performance.

## ✨ Key Features

- 🔄 **Dual-Mode AI Processing**: Local (Ollama) + Online (GPT-4o, Claude-3.5-Sonnet, Gemini Pro)
- 🔐 **Secure API Key Management**: Built-in secure storage using VS Code's SecretStorage API
- ⚡ **Ultra-Fast Inference**: Groq integration with 500+ tokens/second processing
- 🎯 **Smart Provider Selection**: Automatic fallback and intelligent routing
- 📱 **Enhanced UI**: Context-aware chat, inline suggestions, and real-time streaming
- 🔧 **Advanced Configuration**: Comprehensive settings panel with provider management

## 🚀 Quick Start

1. **Install the extension** from the VS Code Marketplace
2. **Open Command Palette** (`Ctrl+Shift+P`)
3. **Run**: "AI Coding Assistant: Open Settings"
4. **Configure AI providers** (local Ollama or online APIs)
5. **Start coding** with AI assistance!

## 📸 Screenshots

![Main Interface](images/screenshot-main.png)
*Main chat interface with dual-mode selection*

![Settings Panel](images/screenshot-settings.png)
*Comprehensive settings panel with provider management*

![Inline Suggestions](images/screenshot-inline.png)
*Real-time inline code suggestions*

## 🎮 Commands & Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Ask Codebase | `Ctrl+Shift+A` | Query your entire codebase |
| Explain Selection | `Ctrl+Shift+E` | Explain selected code |
| Generate Code | `Ctrl+Shift+G` | Generate code from description |
| Toggle Chat | `Ctrl+Shift+C` | Show/hide AI chat panel |
| Open Settings | `Ctrl+Shift+,` | Configure AI providers |
| Switch AI Mode | `Ctrl+Shift+M` | Quick mode switching |

## 🤖 Supported AI Providers

### 🏠 Local Providers (Free & Private)
- **Ollama**: CodeLlama, DeepSeek-Coder, Qwen2.5-Coder

### ☁️ Online Providers (Cloud APIs)
- **OpenAI**: GPT-4o, GPT-4 Turbo ($5 free credit)
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus (Limited free tier)
- **Google AI**: Gemini 1.5 Pro, Gemini 1.5 Flash (Generous free tier)
- **Groq**: Llama 3.1 70B, Mixtral 8x7B (14.4K requests/day free)
- **Together AI**: Llama 3 70B, CodeLlama 34B ($25 free credit)

## 📊 Performance Comparison

| Feature | This Extension | Cursor | Windsurf | Augment Code |
|---------|---------------|--------|----------|--------------|
| Local AI Processing | ✅ | ❌ | ❌ | ✅ |
| Multiple AI Providers | ✅ (6 providers) | ✅ | ✅ | ✅ |
| Offline Capability | ✅ | ❌ | ❌ | ✅ |
| Free Tier | ✅ | ❌ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ | ❌ |

## 🔧 Configuration

### Privacy-First Setup (Local Only)
```json
{
  "aiCodingAssistant.aiMode": "local",
  "aiCodingAssistant.preferredProvider": "ollama"
}
```

### Performance-First Setup (Cloud)
```json
{
  "aiCodingAssistant.aiMode": "online",
  "aiCodingAssistant.preferredProvider": "groq"
}
```

### Balanced Setup (Hybrid)
```json
{
  "aiCodingAssistant.aiMode": "hybrid",
  "aiCodingAssistant.preferredProvider": "ollama",
  "aiCodingAssistant.fallbackProvider": "groq"
}
```

## 📚 Documentation

- [Installation Guide](https://github.com/your-repo/ai-coding-assistant/blob/main/docs/INSTALLATION_GUIDE.md)
- [API Keys Guide](https://github.com/your-repo/ai-coding-assistant/blob/main/docs/API_KEYS_GUIDE.md)
- [Troubleshooting](https://github.com/your-repo/ai-coding-assistant/blob/main/docs/TROUBLESHOOTING.md)
- [Performance Comparison](https://github.com/your-repo/ai-coding-assistant/blob/main/docs/PERFORMANCE_COMPARISON.md)

## 🤝 Support

- [GitHub Issues](https://github.com/your-repo/ai-coding-assistant/issues)
- [Discussions](https://github.com/your-repo/ai-coding-assistant/discussions)
- [Discord Community](https://discord.gg/your-invite)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🤖 Built with ❤️ to democratize AI-powered coding assistance**

*"Making advanced AI coding tools accessible to every developer, everywhere, for free."*
```

### CHANGELOG.md Structure
```markdown
# Change Log

All notable changes to the "AI Coding Assistant" extension will be documented in this file.

## [1.0.0] - 2025-08-24

### Added
- 🎉 Initial release of AI Coding Assistant
- 🔄 Dual-mode AI processing (local + online)
- 🔐 Secure API key management with VS Code SecretStorage
- ⚡ Support for 6 AI providers (Ollama, OpenAI, Anthropic, Google AI, Groq, Together AI)
- 📱 Enhanced chat interface with streaming responses
- 🎯 Inline code suggestions and completions
- 🔧 Comprehensive settings panel
- 🎮 8 keyboard shortcuts for quick access
- 📊 Real-time status indicators
- 🌐 Multi-language code support

### Features
- Context-aware code explanations
- Intelligent code generation
- Semantic codebase search
- Real-time streaming responses
- Automatic provider fallback
- Session management
- Performance monitoring

## [0.9.0] - 2025-08-20

### Added
- Beta release for testing
- Core functionality implementation
- Basic UI components

### Fixed
- Initial bug fixes and optimizations

## [0.8.0] - 2025-08-15

### Added
- Alpha release
- Proof of concept implementation
```

## 📦 Package.json Optimization

### Complete package.json for Marketplace
```json
{
  "name": "ai-coding-assistant",
  "displayName": "AI Coding Assistant - Enhanced with Dual-Mode AI",
  "description": "Comprehensive AI-powered coding assistant with local privacy and cloud performance. Supports GPT-4o, Claude-3.5-Sonnet, Gemini Pro, and local Ollama models.",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://your-website.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/your-repo/ai-coding-assistant",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-repo/ai-coding-assistant.git"
  },
  "bugs": {
    "url": "https://github.com/your-repo/ai-coding-assistant/issues"
  },
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Machine Learning",
    "Programming Languages",
    "Snippets",
    "Other"
  ],
  "keywords": [
    "ai",
    "artificial intelligence",
    "coding assistant",
    "code completion",
    "gpt-4",
    "claude",
    "gemini",
    "ollama",
    "local ai",
    "privacy",
    "code explanation",
    "code generation",
    "augment code",
    "cursor",
    "windsurf",
    "copilot alternative",
    "free ai",
    "open source"
  ],
  "galleryBanner": {
    "color": "#1e1e1e",
    "theme": "dark"
  },
  "icon": "images/icon.png",
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "aiCodingAssistant.askCodebase",
        "title": "Ask Codebase",
        "category": "AI Coding Assistant",
        "icon": "$(search)"
      },
      {
        "command": "aiCodingAssistant.explainSelection",
        "title": "Explain Selection",
        "category": "AI Coding Assistant",
        "icon": "$(info)"
      },
      {
        "command": "aiCodingAssistant.generateCode",
        "title": "Generate Code",
        "category": "AI Coding Assistant",
        "icon": "$(code)"
      },
      {
        "command": "aiCodingAssistant.toggleChat",
        "title": "Toggle Chat Panel",
        "category": "AI Coding Assistant",
        "icon": "$(comment-discussion)"
      },
      {
        "command": "aiCodingAssistant.openSettings",
        "title": "Open Settings",
        "category": "AI Coding Assistant",
        "icon": "$(settings-gear)"
      },
      {
        "command": "aiCodingAssistant.switchMode",
        "title": "Switch AI Mode",
        "category": "AI Coding Assistant",
        "icon": "$(arrow-swap)"
      },
      {
        "command": "aiCodingAssistant.selectProvider",
        "title": "Select AI Provider",
        "category": "AI Coding Assistant",
        "icon": "$(server-environment)"
      },
      {
        "command": "aiCodingAssistant.indexWorkspace",
        "title": "Index Workspace",
        "category": "AI Coding Assistant",
        "icon": "$(database)"
      }
    ],
    "keybindings": [
      {
        "command": "aiCodingAssistant.askCodebase",
        "key": "ctrl+shift+a",
        "mac": "cmd+shift+a"
      },
      {
        "command": "aiCodingAssistant.explainSelection",
        "key": "ctrl+shift+e",
        "mac": "cmd+shift+e"
      },
      {
        "command": "aiCodingAssistant.generateCode",
        "key": "ctrl+shift+g",
        "mac": "cmd+shift+g"
      },
      {
        "command": "aiCodingAssistant.toggleChat",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c"
      },
      {
        "command": "aiCodingAssistant.openSettings",
        "key": "ctrl+shift+,",
        "mac": "cmd+shift+,"
      },
      {
        "command": "aiCodingAssistant.switchMode",
        "key": "ctrl+shift+m",
        "mac": "cmd+shift+m"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "aiCodingAssistant.chatView",
          "name": "AI Chat",
          "when": "aiCodingAssistant.enabled"
        }
      ]
    },
    "viewsContainers": {
      "activitybar": [
        {
          "id": "aiCodingAssistant",
          "title": "AI Coding Assistant",
          "icon": "$(robot)"
        }
      ]
    },
    "configuration": {
      "title": "AI Coding Assistant",
      "properties": {
        "aiCodingAssistant.aiMode": {
          "type": "string",
          "enum": ["local", "online", "hybrid"],
          "default": "local",
          "description": "AI processing mode: local (private), online (cloud APIs), or hybrid (local with cloud fallback)"
        },
        "aiCodingAssistant.preferredProvider": {
          "type": "string",
          "enum": ["ollama", "openai", "anthropic", "google", "groq", "together"],
          "default": "ollama",
          "description": "Preferred AI provider"
        },
        "aiCodingAssistant.enableInlineCompletions": {
          "type": "boolean",
          "default": true,
          "description": "Enable inline code completions"
        },
        "aiCodingAssistant.maxChunkSize": {
          "type": "number",
          "default": 500,
          "description": "Maximum chunk size for code processing"
        },
        "aiCodingAssistant.retrievalCount": {
          "type": "number",
          "default": 10,
          "description": "Number of similar code chunks to retrieve"
        }
      }
    },
    "menus": {
      "editor/context": [
        {
          "command": "aiCodingAssistant.explainSelection",
          "when": "editorHasSelection",
          "group": "aiCodingAssistant@1"
        },
        {
          "command": "aiCodingAssistant.generateCode",
          "group": "aiCodingAssistant@2"
        }
      ],
      "commandPalette": [
        {
          "command": "aiCodingAssistant.askCodebase"
        },
        {
          "command": "aiCodingAssistant.explainSelection",
          "when": "editorHasSelection"
        },
        {
          "command": "aiCodingAssistant.generateCode"
        },
        {
          "command": "aiCodingAssistant.toggleChat"
        },
        {
          "command": "aiCodingAssistant.openSettings"
        },
        {
          "command": "aiCodingAssistant.switchMode"
        },
        {
          "command": "aiCodingAssistant.selectProvider"
        },
        {
          "command": "aiCodingAssistant.indexWorkspace"
        }
      ]
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "lint:fix": "eslint src --ext ts --fix",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/node": "16.x",
    "@typescript-eslint/eslint-plugin": "^5.59.1",
    "@typescript-eslint/parser": "^5.59.1",
    "eslint": "^8.39.0",
    "typescript": "^5.0.4",
    "@vscode/test-electron": "^2.3.0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "ws": "^8.14.0"
  }
}
```

### Icon Requirements
```bash
# Icon specifications for VS Code Marketplace
# Create icon.png in images/ directory

# Requirements:
# - Size: 128x128 pixels (minimum), 512x512 pixels (recommended)
# - Format: PNG with transparency support
# - Style: Simple, recognizable, professional
# - Colors: Should work on both light and dark themes

# Example using ImageMagick to create icon
convert -size 512x512 xc:transparent \
  -fill "#007ACC" -draw "circle 256,256 256,128" \
  -fill "white" -pointsize 200 -gravity center \
  -annotate +0+0 "AI" \
  images/icon.png
```

## 📦 Extension Packaging

### Pre-packaging Validation
```bash
# Validate package.json
vsce package --dry-run

# Check for common issues
vsce ls

# Validate extension manifest
vsce show

# Test extension locally
code --install-extension your-extension.vsix
```

### Packaging Commands
```bash
# Basic packaging
vsce package

# Package with specific version
vsce package --version 1.0.1

# Package with pre-release flag
vsce package --pre-release

# Package and automatically increment version
vsce package --patch  # 1.0.0 -> 1.0.1
vsce package --minor  # 1.0.0 -> 1.1.0
vsce package --major  # 1.0.0 -> 2.0.0
```

### Package Optimization
```bash
# Minimize package size
npm run vscode:prepublish

# Remove development dependencies from package
npm prune --production

# Verify package contents
vsce ls

# Check package size (should be < 50MB)
ls -lh *.vsix
```

### Package Validation Script
```bash
#!/bin/bash
# validate-package.sh

echo "🔍 Validating extension package..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

# Validate required fields
required_fields=("name" "displayName" "description" "version" "publisher" "engines")
for field in "${required_fields[@]}"; do
    if ! jq -e ".$field" package.json > /dev/null; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

# Check icon exists
if [ ! -f "images/icon.png" ]; then
    echo "❌ Icon file not found: images/icon.png"
    exit 1
fi

# Check README exists
if [ ! -f "README.md" ]; then
    echo "❌ README.md not found"
    exit 1
fi

# Check CHANGELOG exists
if [ ! -f "CHANGELOG.md" ]; then
    echo "❌ CHANGELOG.md not found"
    exit 1
fi

# Validate TypeScript compilation
echo "🔨 Compiling TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Package extension
echo "📦 Packaging extension..."
vsce package
if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi

echo "✅ Extension validation complete!"
```

## 🏢 Microsoft Partner Center Setup

### Publisher Account Creation
1. **Visit Partner Center**: Go to [partner.microsoft.com](https://partner.microsoft.com)
2. **Sign In**: Use your Microsoft account
3. **Create Publisher Profile**:
   ```
   Publisher Name: your-publisher-name (must be unique)
   Display Name: Your Display Name
   Contact Email: your.email@example.com
   Website: https://your-website.com (optional)
   ```

### Publisher Verification
```bash
# Required information for verification:
# - Legal business name
# - Business address
# - Tax identification number (if applicable)
# - Phone number
# - Email verification

# Verification process:
# 1. Submit publisher information
# 2. Email verification (automatic)
# 3. Phone verification (SMS/call)
# 4. Business verification (1-3 business days)
```

### Personal Access Token (PAT) Setup
```bash
# Create PAT in Azure DevOps:
# 1. Go to https://dev.azure.com
# 2. Sign in with same Microsoft account
# 3. User Settings → Personal Access Tokens
# 4. New Token with these scopes:
#    - Marketplace (manage) - Required
#    - Marketplace (acquire) - Optional
#    - Marketplace (publish) - Required

# Token configuration:
Name: VS Code Extension Publishing
Organization: All accessible organizations
Expiration: 1 year (maximum)
Scopes: Custom defined → Marketplace (manage, publish)
```

### vsce Login Configuration
```bash
# Login with publisher name and PAT
vsce login your-publisher-name

# Verify login
vsce ls-publishers

# Check current login status
vsce whoami
```

## 🚀 Marketplace Submission

### Initial Publication
```bash
# First-time publication
vsce publish

# Publish with specific version
vsce publish 1.0.0

# Publish as pre-release
vsce publish --pre-release

# Publish with automatic version increment
vsce publish patch  # 1.0.0 -> 1.0.1
vsce publish minor  # 1.0.0 -> 1.1.0
vsce publish major  # 1.0.0 -> 2.0.0
```

### Publication Checklist
```bash
# Pre-publication checklist script
#!/bin/bash
# pre-publish-check.sh

echo "📋 Pre-publication checklist..."

# 1. Version validation
current_version=$(jq -r '.version' package.json)
echo "Current version: $current_version"

# 2. Changelog updated
if ! grep -q "$current_version" CHANGELOG.md; then
    echo "❌ CHANGELOG.md not updated for version $current_version"
    exit 1
fi

# 3. README screenshots updated
if [ ! -f "images/screenshot-main.png" ]; then
    echo "❌ Main screenshot missing"
    exit 1
fi

# 4. All tests passing
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failing"
    exit 1
fi

# 5. No TypeScript errors
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation errors"
    exit 1
fi

# 6. Package size check
vsce package
package_size=$(stat -f%z *.vsix 2>/dev/null || stat -c%s *.vsix)
max_size=$((50 * 1024 * 1024))  # 50MB

if [ $package_size -gt $max_size ]; then
    echo "❌ Package too large: $(($package_size / 1024 / 1024))MB (max 50MB)"
    exit 1
fi

echo "✅ Pre-publication checks passed!"
```

### Submission Process
1. **Package Extension**: `vsce package`
2. **Test Locally**: Install and test the .vsix file
3. **Publish**: `vsce publish`
4. **Monitor**: Check marketplace for publication status

### Publication Status Monitoring
```bash
# Check publication status
vsce show your-publisher.ai-coding-assistant

# View extension statistics
vsce show your-publisher.ai-coding-assistant --json

# Monitor marketplace listing
curl -s "https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant"
```

## 🔄 Version Management

### Semantic Versioning Strategy
```
Version Format: MAJOR.MINOR.PATCH

MAJOR: Breaking changes, incompatible API changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible

Examples:
1.0.0 → 1.0.1 (bug fix)
1.0.1 → 1.1.0 (new feature)
1.1.0 → 2.0.0 (breaking change)
```

### Automated Version Management
```bash
# package.json scripts for version management
{
  "scripts": {
    "version:patch": "npm version patch && vsce publish",
    "version:minor": "npm version minor && vsce publish",
    "version:major": "npm version major && vsce publish",
    "version:prerelease": "npm version prerelease --preid=beta && vsce publish --pre-release"
  }
}

# Usage:
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0
npm run version:prerelease  # 1.0.0 → 1.0.1-beta.0
```

### Release Management Script
```bash
#!/bin/bash
# release.sh

set -e

# Get current version
current_version=$(jq -r '.version' package.json)
echo "Current version: $current_version"

# Prompt for release type
echo "Select release type:"
echo "1) Patch (bug fixes)"
echo "2) Minor (new features)"
echo "3) Major (breaking changes)"
echo "4) Pre-release"
read -p "Enter choice (1-4): " choice

case $choice in
    1) release_type="patch" ;;
    2) release_type="minor" ;;
    3) release_type="major" ;;
    4) release_type="prerelease" ;;
    *) echo "Invalid choice"; exit 1 ;;
esac

# Update version
if [ "$release_type" = "prerelease" ]; then
    npm version prerelease --preid=beta
    new_version=$(jq -r '.version' package.json)
    echo "Updated to pre-release version: $new_version"
else
    npm version $release_type
    new_version=$(jq -r '.version' package.json)
    echo "Updated to version: $new_version"
fi

# Update CHANGELOG
echo "## [$new_version] - $(date +%Y-%m-%d)" > temp_changelog.md
echo "" >> temp_changelog.md
echo "### Added" >> temp_changelog.md
echo "- " >> temp_changelog.md
echo "" >> temp_changelog.md
echo "### Changed" >> temp_changelog.md
echo "- " >> temp_changelog.md
echo "" >> temp_changelog.md
echo "### Fixed" >> temp_changelog.md
echo "- " >> temp_changelog.md
echo "" >> temp_changelog.md
cat CHANGELOG.md >> temp_changelog.md
mv temp_changelog.md CHANGELOG.md

echo "📝 Please update CHANGELOG.md with release notes"
read -p "Press Enter when CHANGELOG is updated..."

# Run tests
echo "🧪 Running tests..."
npm test

# Package and publish
echo "📦 Packaging extension..."
vsce package

echo "🚀 Publishing to marketplace..."
if [ "$release_type" = "prerelease" ]; then
    vsce publish --pre-release
else
    vsce publish
fi

echo "✅ Release $new_version published successfully!"
```

### Pre-release Management
```bash
# Publish pre-release versions for testing
vsce publish --pre-release

# Pre-release naming convention:
# 1.0.0-beta.0
# 1.0.0-beta.1
# 1.0.0-rc.0
# 1.0.0-rc.1

# Promote pre-release to stable
vsce publish  # Removes pre-release flag
```

## 🔍 Discovery Optimization

### Keyword Optimization
```json
{
  "keywords": [
    // Primary keywords (most important)
    "ai", "artificial intelligence", "coding assistant",

    // Feature keywords
    "code completion", "code generation", "code explanation",
    "inline suggestions", "chat", "local ai", "privacy",

    // Provider keywords
    "gpt-4", "claude", "gemini", "ollama", "openai", "anthropic",

    // Competitor keywords
    "augment code", "cursor", "windsurf", "copilot alternative",

    // Technology keywords
    "typescript", "javascript", "python", "react", "node",

    // Value proposition
    "free ai", "open source", "offline", "dual mode"
  ]
}
```

### Category Selection Strategy
```json
{
  "categories": [
    "Machine Learning",      // Primary category
    "Programming Languages", // Secondary category
    "Snippets",             // For code generation features
    "Other"                 // Catch-all for unique features
  ]
}
```

### Description Optimization
```json
{
  "description": "Comprehensive AI-powered coding assistant with local privacy and cloud performance. Supports GPT-4o, Claude-3.5-Sonnet, Gemini Pro, and local Ollama models. Features dual-mode operation, secure API key management, real-time streaming, and inline suggestions. Free alternative to Cursor, Windsurf, and Augment Code."
}
```

### README SEO Optimization
```markdown
<!-- Include these elements for better discoverability -->

# AI Coding Assistant - Enhanced with Dual-Mode AI Processing

<!-- Badges for credibility -->
[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/your-publisher.ai-coding-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant)

<!-- Key value propositions in first paragraph -->
A comprehensive AI-powered coding assistant that **matches and exceeds** the functionality of **Augment Code**, **Cursor**, and **Windsurf**. Features **dual-mode operation** with seamless switching between **local privacy** (Ollama) and **cloud performance** (GPT-4o, Claude-3.5-Sonnet, Gemini Pro).

<!-- Feature highlights with emojis for visual appeal -->
## ✨ Key Features

- 🔄 **Dual-Mode AI Processing**: Local (Ollama) + Online (GPT-4o, Claude-3.5-Sonnet, Gemini Pro)
- 🔐 **Secure API Key Management**: Built-in secure storage using VS Code's SecretStorage API
- ⚡ **Ultra-Fast Inference**: Groq integration with 500+ tokens/second processing
- 🎯 **Smart Provider Selection**: Automatic fallback and intelligent routing
- 📱 **Enhanced UI**: Context-aware chat, inline suggestions, and real-time streaming
- 🔧 **Advanced Configuration**: Comprehensive settings panel with provider management

<!-- Screenshots for visual engagement -->
## 📸 Screenshots

![Main Interface](images/screenshot-main.png)
*Dual-mode AI processing with provider selection*

![Settings Panel](images/screenshot-settings.png)
*Comprehensive configuration panel*

<!-- Comparison table for competitive positioning -->
## 📊 vs. Competition

| Feature | This Extension | Cursor | Windsurf | Augment Code |
|---------|---------------|--------|----------|--------------|
| **Local AI Processing** | ✅ | ❌ | ❌ | ✅ |
| **Multiple AI Providers** | ✅ (6 providers) | ✅ | ✅ | ✅ |
| **Free Tier** | ✅ | ❌ | ❌ | ❌ |
| **Open Source** | ✅ | ❌ | ❌ | ❌ |
```

### Screenshot Guidelines
```bash
# Screenshot requirements for marketplace
# 1. Main interface screenshot (required)
# 2. Settings/configuration screenshot
# 3. Feature demonstration screenshots
# 4. Before/after comparison screenshots

# Screenshot specifications:
# - Format: PNG
# - Size: 1280x720 (16:9 ratio) or 1920x1080
# - Quality: High resolution, clear text
# - Content: Show actual extension in use
# - Annotations: Highlight key features

# Tools for creating screenshots:
# - macOS: Screenshot utility (Cmd+Shift+5)
# - Windows: Snipping Tool or Snip & Sketch
# - Linux: GNOME Screenshot or Spectacle
# - Cross-platform: LightShot, Greenshot
```

## 📈 Post-Publication Management

### Monitoring Extension Performance
```bash
# Extension analytics script
#!/bin/bash
# analytics.sh

PUBLISHER="your-publisher"
EXTENSION="ai-coding-assistant"

# Get extension statistics
vsce show $PUBLISHER.$EXTENSION --json > stats.json

# Extract key metrics
installs=$(jq -r '.statistics.install' stats.json)
downloads=$(jq -r '.statistics.download' stats.json)
rating=$(jq -r '.statistics.averagerating' stats.json)
reviews=$(jq -r '.statistics.ratingcount' stats.json)

echo "📊 Extension Analytics"
echo "====================="
echo "Installs: $installs"
echo "Downloads: $downloads"
echo "Rating: $rating/5"
echo "Reviews: $reviews"

# Check for updates needed
current_version=$(jq -r '.versions[0].version' stats.json)
local_version=$(jq -r '.version' package.json)

if [ "$current_version" != "$local_version" ]; then
    echo "⚠️ Version mismatch: Marketplace($current_version) vs Local($local_version)"
fi
```

### User Feedback Management
```bash
# Review monitoring script
#!/bin/bash
# monitor-reviews.sh

# Check marketplace reviews (requires web scraping or API)
curl -s "https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-coding-assistant" \
  | grep -o 'rating-[0-9]' | sort | uniq -c

# GitHub issues monitoring
gh issue list --repo your-repo/ai-coding-assistant --state open --json number,title,labels

# Discord/community monitoring
# Set up webhooks or bots to monitor community channels
```

### Update Strategy
```json
{
  "updateSchedule": {
    "patch": "Weekly (bug fixes)",
    "minor": "Monthly (new features)",
    "major": "Quarterly (breaking changes)",
    "security": "Immediate (security fixes)"
  },
  "releaseNotes": {
    "format": "markdown",
    "sections": ["Added", "Changed", "Fixed", "Security"],
    "includeScreenshots": true,
    "highlightBreakingChanges": true
  }
}
```

### Community Engagement
```markdown
# Community engagement checklist:

## GitHub Repository
- [ ] Respond to issues within 24 hours
- [ ] Label issues appropriately (bug, feature, question)
- [ ] Create issue templates for bug reports and feature requests
- [ ] Maintain project roadmap and milestones
- [ ] Regular releases with detailed changelog

## VS Code Marketplace
- [ ] Respond to reviews (especially negative ones)
- [ ] Update extension description based on feedback
- [ ] Add requested features to roadmap
- [ ] Thank users for positive feedback

## Social Media & Community
- [ ] Share updates on Twitter/LinkedIn
- [ ] Participate in VS Code community discussions
- [ ] Create tutorial videos/blog posts
- [ ] Engage with developer communities (Reddit, Discord)
```

## 🔧 Troubleshooting

### Common Publication Issues

#### Issue 1: "Publisher not found"
```bash
# Solution:
vsce login your-publisher-name
# Enter your Personal Access Token when prompted

# Verify login:
vsce whoami
```

#### Issue 2: "Package too large"
```bash
# Check package contents:
vsce ls

# Common causes and solutions:
# 1. node_modules included (add to .vscodeignore)
echo "node_modules/**" >> .vscodeignore

# 2. Large assets (optimize images)
find images/ -name "*.png" -exec optipng {} \;

# 3. Source files included (add to .vscodeignore)
echo "src/**" >> .vscodeignore
echo "**/*.ts" >> .vscodeignore
```

#### Issue 3: "Invalid manifest"
```bash
# Validate package.json:
npm run compile
vsce package --dry-run

# Common issues:
# - Missing required fields (name, version, publisher, engines)
# - Invalid version format (must be semver)
# - Missing main entry point
# - Invalid category names
```

#### Issue 4: "Authentication failed"
```bash
# Regenerate Personal Access Token:
# 1. Go to https://dev.azure.com
# 2. User Settings → Personal Access Tokens
# 3. Revoke old token
# 4. Create new token with Marketplace (manage) scope
# 5. Login again: vsce login your-publisher-name
```

#### Issue 5: "Extension not appearing in marketplace"
```bash
# Check publication status:
vsce show your-publisher.extension-name

# Common causes:
# 1. Publication still processing (wait 5-10 minutes)
# 2. Extension flagged for review (check email)
# 3. Publisher account not verified
# 4. Extension violates marketplace policies
```

### Debugging Publication Process
```bash
# Enable verbose logging:
vsce publish --verbose

# Check extension validation:
vsce package --dry-run --verbose

# Test extension locally before publishing:
code --install-extension your-extension.vsix
```

### Rollback Strategy
```bash
# If published version has critical issues:

# 1. Unpublish current version (last resort)
vsce unpublish your-publisher.extension-name@1.0.1

# 2. Publish fixed version immediately
vsce publish patch

# 3. Notify users via:
# - GitHub release notes
# - Extension changelog
# - Community channels
```

## 📋 Complete Publishing Checklist

### Pre-Publication Checklist
- [ ] **Code Quality**
  - [ ] All TypeScript compilation errors fixed
  - [ ] ESLint warnings addressed
  - [ ] All tests passing
  - [ ] Code coverage > 80%

- [ ] **Extension Manifest**
  - [ ] package.json complete and valid
  - [ ] Version number updated
  - [ ] Keywords optimized for discovery
  - [ ] Categories selected appropriately
  - [ ] Icon created (128x128 minimum)

- [ ] **Documentation**
  - [ ] README.md comprehensive and up-to-date
  - [ ] CHANGELOG.md updated with new version
  - [ ] Screenshots current and high-quality
  - [ ] License file included

- [ ] **Testing**
  - [ ] Extension tested locally
  - [ ] All commands working
  - [ ] Settings panel functional
  - [ ] No console errors

- [ ] **Publisher Setup**
  - [ ] Microsoft Partner Center account verified
  - [ ] Personal Access Token valid
  - [ ] vsce login successful

### Publication Process
- [ ] **Package Creation**
  - [ ] `vsce package` successful
  - [ ] Package size < 50MB
  - [ ] Package contents verified with `vsce ls`

- [ ] **Publication**
  - [ ] `vsce publish` successful
  - [ ] Extension appears in marketplace (5-10 minutes)
  - [ ] Installation test from marketplace

- [ ] **Post-Publication**
  - [ ] Smoke test installed extension
  - [ ] Monitor for user feedback
  - [ ] Update project documentation
  - [ ] Announce release on social media

### Ongoing Maintenance
- [ ] **Regular Updates**
  - [ ] Monitor GitHub issues
  - [ ] Respond to marketplace reviews
  - [ ] Plan feature roadmap
  - [ ] Security updates as needed

- [ ] **Analytics Monitoring**
  - [ ] Track installation metrics
  - [ ] Monitor user ratings
  - [ ] Analyze usage patterns
  - [ ] Gather feature requests

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)
```json
{
  "metrics": {
    "installs": {
      "target": "10,000 in first month",
      "tracking": "VS Code Marketplace analytics"
    },
    "rating": {
      "target": "4.5+ stars",
      "tracking": "Marketplace reviews"
    },
    "activeUsers": {
      "target": "70% retention after 30 days",
      "tracking": "Telemetry (if implemented)"
    },
    "communityEngagement": {
      "target": "100+ GitHub stars",
      "tracking": "GitHub repository metrics"
    }
  }
}
```

### Growth Strategies
1. **Content Marketing**
   - Blog posts about AI coding
   - Tutorial videos
   - Developer conference talks

2. **Community Building**
   - Discord server for users
   - Regular AMAs (Ask Me Anything)
   - User showcase features

3. **Partnerships**
   - Integration with popular tools
   - Collaboration with other extension authors
   - Sponsorship of developer events

4. **Feature Development**
   - User-requested features
   - Competitive feature parity
   - Innovation in AI coding assistance

---

## 🎉 Conclusion

This comprehensive guide provides everything needed to successfully publish and maintain the AI Coding Assistant extension on the VS Code Marketplace. The guide covers:

✅ **Complete setup process** from prerequisites to publication
✅ **Extension optimization** for maximum discoverability
✅ **Professional package.json** configuration
✅ **Marketplace best practices** for success
✅ **Version management** strategies
✅ **Post-publication maintenance** procedures
✅ **Troubleshooting solutions** for common issues

### Next Steps:
1. Complete the extension development and testing
2. Optimize package.json and documentation
3. Create high-quality screenshots and icon
4. Set up Microsoft Partner Center account
5. Follow the publication checklist
6. Monitor and maintain the extension post-publication

**The AI Coding Assistant is now ready for VS Code Marketplace publication! 🚀**

With this guide, you have everything needed to successfully publish, promote, and maintain a professional VS Code extension that can compete with the best AI coding assistants in the marketplace.
