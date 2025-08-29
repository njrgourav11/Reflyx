# Reflyx Multi-Agent Backend (Node/Express)

This Node.js/Express server implements a multi-agent AI system to support complete SDLC workflows and mirrors legacy endpoints expected by the VS Code extension.

## Features
- REST API under `/api/v1` with health, query, generate, etc.
- Multi-agent endpoints under `/api/v1/agents/*`
- WebSocket at `/ws/chat`
- Correlation IDs and structured error responses
- TypeScript project with build scripts

## Quick start
```
cd server-node
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:8000/api/v1/health

## Scripts
- `npm run dev` — start in watch mode
- `npm run build` — compile TypeScript
- `npm start` — run compiled `dist/server.js`

## API
- `GET /api/v1/health`
- `POST /api/v1/health/detailed`
- `POST /api/v1/query`
- `POST /api/v1/explain`
- `POST /api/v1/generate`
- `POST /api/v1/index`
- `POST /api/v1/index/file`
- `GET /api/v1/stats`
- `POST /api/v1/agents/analyzer`
- `POST /api/v1/agents/architecture`
- `POST /api/v1/agents/generator`
- `POST /api/v1/agents/fixer`
- `POST /api/v1/agents/testing`
- `POST /api/v1/agents/orchestrate`

## Notes
Current agent implementations are stubs returning structured JSON. They are ready to be enhanced with real analysis/generation/testing logic.

