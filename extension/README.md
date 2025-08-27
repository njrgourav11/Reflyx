# Reflyx

Reflyx is a local-first AI coding assistant for VS Code with semantic search, code explanations, and code generation.

## Features
- Chat side panel (Activity Bar → Reflyx) with:
  - Ask questions about your codebase (/api/v1/query)
  - Explain selected code (/api/v1/explain)
  - Generate code (/api/v1/generate)
  - Find similar code patterns
  - Index current file or entire workspace
- Inline helpers:
  - Hover explanations
  - CodeLens for common AI actions
- Commands (Command Palette):
  - Reflyx: Ask Codebase
  - Reflyx: Explain Selection
  - Reflyx: Generate Code
  - Reflyx: Find Similar Code
  - Reflyx: Refactor Suggestion
  - Reflyx: Index Workspace
  - Reflyx: Toggle Chat Panel
  - Reflyx: Check Server Health

## Getting Started
1. Start the backend server (FastAPI):
   - Default URL: http://localhost:8000
2. Install the extension and reload VS Code.
3. Open Reflyx from the Activity Bar, or run "Reflyx: Toggle Chat Panel".
4. (Optional) Configure settings:
   - Reflyx → Server URL
   - AI mode and provider
   - Auto-indexing and ignore patterns

## Usage Tips
- Use "Index Workspace" first for best results.
- Select code and run "Explain Selection" from the editor context menu.
- Press Ctrl+Shift+C (Cmd+Shift+C on macOS) to open the chat quickly.

## Offline-first
Reflyx is designed to work with local models (Ollama), and supports hybrid or online modes for flexibility.

## License
MIT

